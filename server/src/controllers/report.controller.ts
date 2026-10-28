import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Report from '../models/Report.model';
import { reportSchema, statusUpdateSchema, regionForPoint } from '@samudra/shared';
import { asyncHandler } from '../utils/asyncHandler';
import { emitReportCreated, emitReportUpdated } from '../services/realtime.service';
import { sendToRegion } from '../services/notifications.service';

export const createReport = asyncHandler(async (req: Request, res: Response) => {
  const data = reportSchema.parse(req.body);
  const userId = (req as any).user.id as string;

  const region = regionForPoint(data.location.lat, data.location.lng);

  const report = await Report.create({
    ...data,
    createdBy: userId,
    region,
    location: {
      type: 'Point',
      coordinates: [data.location.lng, data.location.lat],
    },
    statusHistory: [{ status: 'pending', updatedBy: userId, updatedAt: new Date() }],
  });

  await report.populate('createdBy', 'name');

  res.status(201).json(report);
});

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const { status, category, severity, region, page = 1, limit = 10 } = req.query;

  const query: any = {};
  if (status && status !== 'All') query.status = status;
  if (category && category !== 'All') query.category = category;
  if (region && region !== 'All') query.region = region;

  if (severity && severity !== 'All') {
    const sevNum = Number(severity);
    if (!isNaN(sevNum)) query.severity = { $gte: sevNum };
  }

  const limitNum = Math.min(Number(limit), 50);
  const pageNum = Math.max(Number(page), 1);

  const [reports, total] = await Promise.all([
    Report.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .populate('createdBy', 'name'),
    Report.countDocuments(query),
  ]);

  res.json({
    reports,
    total,
    pages: Math.ceil(total / limitNum),
    page: pageNum,
  });
});

export const getReportById = asyncHandler(async (req: Request, res: Response) => {
  const report = await Report.findById(req.params.id).populate('createdBy', 'name');
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json(report);
});

export const updateReportStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, reason } = statusUpdateSchema.parse(req.body);
  const userId = (req as any).user.id as string;

  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });

  report.status = status;
  report.statusHistory.push({
    status,
    reason,
    updatedBy: new mongoose.Types.ObjectId(userId),
    updatedAt: new Date(),
  });
  await report.save();
  await report.populate([
    { path: 'createdBy', select: 'name' },
    { path: 'statusHistory.updatedBy', select: 'name' },
  ]);

  // Live update to all clients
  emitReportUpdated(report.toJSON(), report.region);

  // A newly verified report enters the public feed
  if (status === 'verified') {
    emitReportCreated(report.toJSON(), report.region);

    // Auto push for high-severity verified reports
    if (report.severity >= 8) {
      sendToRegion(report.region, {
        title: `⚠️ ${report.category} — Severity ${report.severity}/10`,
        body: report.title,
        data: { reportId: String(report._id), severity: String(report.severity) },
      }).catch(() => undefined);
    }
  }

  res.json(report);
});

/** Geo query: reports within radiusKm of a point. */
export const getNearbyReports = asyncHandler(async (req: Request, res: Response) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Number(req.query.radiusKm ?? 50);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ message: 'lat and lng are required' });
  }

  const reports = await Report.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distanceMeters',
        maxDistance: radiusKm * 1000,
        spherical: true,
        query: { status: { $in: ['verified', 'resolved'] } },
      },
    },
    { $sort: { distanceMeters: 1 } },
    { $limit: 100 },
  ]);

  res.json(reports);
});

/** Rich admin stats: status counts, today, avg verification time, 7-day trend. */
export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [byStatus, todayCount, trend, verifTimes] = await Promise.all([
    Report.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Report.countDocuments({ createdAt: { $gte: startOfToday } }),
    Report.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Report.aggregate([
      { $unwind: '$statusHistory' },
      { $match: { 'statusHistory.status': 'verified' } },
      {
        $project: {
          diffMs: { $subtract: ['$statusHistory.updatedAt', '$createdAt'] },
        },
      },
      { $group: { _id: null, avg: { $avg: '$diffMs' } } },
    ]),
  ]);

  const statusCounts = byStatus.reduce<Record<string, number>>((acc, s) => {
    acc[s._id] = s.count;
    return acc;
  }, {});

  const avgVerifMs = verifTimes[0]?.avg ?? 0;

  res.json({
    byStatus: statusCounts,
    todayCount,
    trend: trend.map((t) => ({ date: t._id, count: t.count })),
    avgVerificationMinutes: Math.round(avgVerifMs / 60000),
    total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
  });
});
