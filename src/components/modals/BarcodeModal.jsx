import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Barcode, X, Package, Download, Printer } from 'lucide-react';

export default function BarcodeModal({
  isOpen,
  onClose,
  product,
  printCopies,
  setPrintCopies
}) {
  const barcodeSvgRef = useRef(null);

  useEffect(() => {
    if (isOpen && product && barcodeSvgRef.current) {
      try {
        const code = product.barcode || `${product.id}`;
        JsBarcode(barcodeSvgRef.current, code, {
          format: 'CODE128',
          lineColor: '#000000',
          width: 2,
          height: 55,
          displayValue: true,
          fontSize: 13,
          font: 'monospace',
          margin: 8,
          background: '#ffffff'
        });
      } catch (e) {
        console.error('JsBarcode render error:', e);
      }
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleDownloadPng = () => {
    const svg = barcodeSvgRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const svgSize = svg.getBoundingClientRect();
    canvas.width = svgSize.width * 2 || 600;
    canvas.height = svgSize.height * 2 || 240;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.setAttribute('src', 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData))));
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `Barcode_${product.name}_${product.barcode || product.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
  };

  const handlePrintLabels = () => {
    const printWindow = window.open('', '_blank');
    const copies = parseInt(printCopies, 10) || 1;
    const svgHtml = barcodeSvgRef.current ? barcodeSvgRef.current.outerHTML : '';

    let stickersHtml = '';
    for (let i = 0; i < copies; i++) {
      stickersHtml += `
        <div class="sticker">
          <div class="title">${product.name}</div>
          <div class="barcode">${svgHtml}</div>
          <div class="price">฿${product.sell_price.toFixed(2)}</div>
        </div>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>พิมพ์บาร์โค้ด - ${product.name}</title>
          <style>
            @page { margin: 5mm; size: auto; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 10px; }
            .grid { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; }
            .sticker {
              width: 50mm;
              height: 32mm;
              border: 1px dashed #ccc;
              box-sizing: border-box;
              padding: 4px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              text-align: center;
              page-break-inside: avoid;
            }
            .title { font-size: 11px; font-weight: bold; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 100%; }
            .barcode { max-width: 100%; overflow: hidden; }
            .barcode svg { width: 100%; height: 35px; }
            .price { font-size: 14px; font-weight: 800; color: #000; }
          </style>
        </head>
        <body>
          <div class="grid">${stickersHtml}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-['Prompt',sans-serif] animate-fadeIn select-none">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#EAE7E1] shadow-2xl overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="p-4 border-b border-[#EAE7E1] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F7F6F2] border border-[#EAE7E1] text-[#181A18] flex items-center justify-center">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#181A18]">
                พิมพ์สติกเกอร์บาร์โค้ด Code 128
              </h3>
              <p className="text-[11px] text-[#717672]">
                พิมพ์สติกเกอร์ติดสินค้าเพื่อยิงสแกนขายหน้าร้านได้ทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#717672] hover:text-[#181A18] p-1.5 rounded-lg hover:bg-[#F7F6F2] transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#F7F6F2] rounded-xl border border-[#EAE7E1]">
            <div className="w-10 h-10 rounded-lg bg-white border border-[#EAE7E1] overflow-hidden flex items-center justify-center shrink-0">
              {product.image_url ? (
                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Package className="w-5 h-5 text-[#A6ADA8]" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-[#181A18] truncate">{product.name}</h4>
              <p className="text-[11px] text-[#717672] font-mono">รหัส: {product.barcode || product.id}</p>
            </div>
          </div>

          {/* Barcode Sticker Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-white border border-dashed border-[#D5D2CB] rounded-2xl shadow-2xs text-center">
            <span className="text-xs font-bold text-[#181A18] line-clamp-1 mb-1">
              {product.name}
            </span>

            <div className="my-1 bg-white p-1">
              <svg ref={barcodeSvgRef} id="barcode-svg" className="max-w-full"></svg>
            </div>

            <span className="text-sm font-bold text-[#181A18] font-mono">
              ฿{product.sell_price.toFixed(2)}
            </span>
          </div>

          {/* Copies Selector */}
          <div className="p-3.5 bg-[#F7F6F2] rounded-2xl border border-[#EAE7E1] space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#181A18]">
              <span>จำนวนดวงที่ต้องการพิมพ์:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={printCopies}
                  onChange={(e) => setPrintCopies(e.target.value)}
                  className="w-16 px-2 py-1 text-center font-bold bg-white border border-[#EAE7E1] rounded-lg text-xs font-mono text-[#181A18] focus:outline-none focus:ring-2 focus:ring-[#181A18]/20 focus:border-[#181A18]"
                />
                <span className="text-[#717672] text-xs">ดวง</span>
              </div>
            </div>

            <div className="flex gap-1.5 pt-0.5">
              {[1, 10, 30, product.stock_qty].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPrintCopies(num)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    printCopies === num
                      ? 'bg-[#181A18] text-white border-[#181A18] shadow-xs'
                      : 'bg-white text-[#717672] border-[#EAE7E1] hover:text-[#181A18]'
                  }`}
                >
                  {num === product.stock_qty ? `สต็อก (${num})` : `${num} ดวง`}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="py-2.5 px-3 bg-white hover:bg-[#F7F6F2] text-[#181A18] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#EAE7E1] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#717672]" />
              <span>โหลดรูป PNG</span>
            </button>

            <button
              type="button"
              onClick={handlePrintLabels}
              className="py-2.5 px-3 bg-[#181A18] hover:bg-[#2C302D] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์สติกเกอร์</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}