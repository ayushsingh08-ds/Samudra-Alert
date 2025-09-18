// src/pages/hooks/useExport.js
import { useCallback } from "react";

export function useExport() {
  const downloadJSON = useCallback((data, filename = "analyst_export.json") => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: "application/json" 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportPDF = useCallback(async (data, filename = "analyst_report.pdf") => {
    try {
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(16);
      doc.text("Analyst Dashboard Report", 15, 20);
      
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 30);
      
      let yPos = 45;
      
      // Summary section
      doc.setFontSize(12);
      doc.text("Summary", 15, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      const summaryText = [
        `Total Records: ${data.summary?.totalRecords || 0}`,
        `Valid Records: ${data.summary?.valid || 0}`,
        `Invalid Records: ${data.summary?.invalid || 0}`,
        `Quality Score: ${data.summary?.valid && data.summary?.totalRecords ? 
          ((data.summary.valid / data.summary.totalRecords) * 100).toFixed(1) : 0}%`
      ];
      
      summaryText.forEach(text => {
        doc.text(text, 20, yPos);
        yPos += 8;
      });
      
      // Insights section
      if (data.insights && data.insights.length > 0) {
        yPos += 10;
        doc.setFontSize(12);
        doc.text("Key Insights", 15, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        data.insights.forEach((insight, index) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          const lines = doc.splitTextToSize(`${index + 1}. ${insight.text}`, 180);
          lines.forEach(line => {
            doc.text(line, 20, yPos);
            yPos += 6;
          });
          yPos += 4;
        });
      }
      
      // Hotspots section
      if (data.topHotspots && data.topHotspots.length > 0) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }
        
        yPos += 10;
        doc.setFontSize(12);
        doc.text("Top Hotspots", 15, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        data.topHotspots.slice(0, 5).forEach((hotspot, index) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          const coords = hotspot.centroid && 
            isFinite(hotspot.centroid.lat) && 
            isFinite(hotspot.centroid.lon)
            ? `${hotspot.centroid.lat.toFixed(4)}, ${hotspot.centroid.lon.toFixed(4)}`
            : "Coordinates unavailable";
          
          doc.text(`${index + 1}. Location: ${coords}`, 20, yPos);
          yPos += 6;
          doc.text(`   High Risk: ${hotspot.countHigh || 0}, Total Points: ${hotspot.points?.length || 0}`, 20, yPos);
          yPos += 10;
        });
      }
      
      doc.save(filename);
      return true;
      
    } catch (error) {
      console.warn("PDF export failed, falling back to JSON:", error);
      downloadJSON(data, filename.replace(".pdf", ".json"));
      return false;
    }
  }, [downloadJSON]);

  const handleExport = useCallback(async (data, format = "pdf") => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `analyst_report_${timestamp}`;
    
    try {
      if (format === "pdf") {
        await exportPDF(data, `${filename}.pdf`);
      } else {
        downloadJSON(data, `${filename}.json`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      // Fallback to JSON
      downloadJSON(data, `${filename}.json`);
    }
  }, [exportPDF, downloadJSON]);

  return {
    handleExport,
    exportPDF,
    downloadJSON
  };
}
