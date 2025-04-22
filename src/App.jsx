// Vite + React + pdf-lib
import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default function App() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    date: "",
  });

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ description: "", price: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    if (newItem.description && newItem.price) {
      setItems((prev) => [...prev, { ...newItem, price: parseFloat(newItem.price) }]);
      setNewItem({ description: "", price: "" });
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const generateInvoiceNumber = () => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // ex: 20250422
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // ex: 0931
    return `${datePart}-${randomPart}`; // → "20250422-0931"
  };

  

  const TAX_RATE = 0.2;

  const generatePDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
  
    const imageUrl = "/logo.png";
    const imageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(imageBytes);
    const pngDims = pngImage.scale(0.15);
  
    // Logo
    page.drawImage(pngImage, {
      x: 50,
      y: height - 70,
      width: pngDims.width,
      height: pngDims.height,
    });
  
    // Title
    const invoiceNumber = generateInvoiceNumber();
    const title = `Invoice No. ${invoiceNumber}`;
    const fontSize = 20;
    const titleWidth = font.widthOfTextAtSize(title, fontSize);
    const xTitle = (width - titleWidth) / 2;
  
    page.drawText(title, {
      x: xTitle,
      y: height - 50,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
  
    // Client Info
    page.drawText(`Client: ${formData.firstname} ${formData.lastname}`, {
      x: 50,
      y: height - 110,
      size: 14,
      font,
    });
  
    page.drawText(`Phone: ${formData.phone}`, {
      x: 50,
      y: height - 130,
      size: 14,
      font,
    });
  
    page.drawText(`Address: ${formData.address}`, {
      x: 50,
      y: height - 150,
      size: 14,
      font,
    });
  
    page.drawText(`${formData.postcode} ${formData.town}`, {
      x: 50,
      y: height - 170,
      size: 14,
      font,
    });
  
    page.drawText(`Date: ${formData.date}`, {
      x: 50,
      y: height - 190,
      size: 14,
      font,
    });
  
    // Table
    const colDescWidth = 300;
    const colPriceWidth = 100;
    const tableX = 50;
    let tableY = height - 240;
    const rowHeight = 25;
    const tableFontSize = 12;
  
    // Table Header
    page.drawRectangle({
      x: tableX,
      y: tableY,
      width: colDescWidth + colPriceWidth,
      height: rowHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
      color: rgb(0.9, 0.9, 0.9),
    });
  
    page.drawText("Description", {
      x: tableX + 5,
      y: tableY + 7,
      size: tableFontSize,
      font,
    });
  
    page.drawText("Price (€)", {
      x: tableX + colDescWidth + 5,
      y: tableY + 7,
      size: tableFontSize,
      font,
    });
  
    tableY -= rowHeight;
  
    // Table Rows
    items.forEach((item) => {
      page.drawRectangle({
        x: tableX,
        y: tableY,
        width: colDescWidth,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
  
      page.drawRectangle({
        x: tableX + colDescWidth,
        y: tableY,
        width: colPriceWidth,
        height: rowHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
  
      page.drawText(item.description, {
        x: tableX + 5,
        y: tableY + 7,
        size: tableFontSize,
        font,
      });
  
      page.drawText(`${item.price.toFixed(2)} €`, {
        x: tableX + colDescWidth + 5,
        y: tableY + 7,
        size: tableFontSize,
        font,
      });
  
      tableY -= rowHeight;
    });
  
    // Totals
    const subtotal = calculateSubtotal();
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
  
    const totalStartY = tableY - 10;
    const totalLabelX = tableX + colDescWidth - 60;
    const totalValueX = tableX + colDescWidth + 5;
  
    page.drawText("Subtotal:", {
      x: totalLabelX,
      y: totalStartY,
      size: tableFontSize,
      font,
    });
    page.drawText(`${subtotal.toFixed(2)} €`, {
      x: totalValueX,
      y: totalStartY,
      size: tableFontSize,
      font,
    });
  
    page.drawText("Tax (20%):", {
      x: totalLabelX,
      y: totalStartY - 18,
      size: tableFontSize,
      font,
    });
    page.drawText(`${tax.toFixed(2)} €`, {
      x: totalValueX,
      y: totalStartY - 18,
      size: tableFontSize,
      font,
    });
  
    page.drawText("Total:", {
      x: totalLabelX,
      y: totalStartY - 36,
      size: tableFontSize + 1,
      font,
    });
    page.drawText(`${total.toFixed(2)} €`, {
      x: totalValueX,
      y: totalStartY - 36,
      size: tableFontSize + 1,
      font,
    });
  
    // Signature Area
    page.drawText("Client's Signature:", {
      x: tableX,
      y: totalStartY - 80,
      size: 12,
      font,
    });
    page.drawLine({
      start: { x: tableX + 130, y: totalStartY - 82 },
      end: { x: tableX + 300, y: totalStartY - 82 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  
    // Save and download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `invoice-${invoiceNumber}.pdf`;
    link.click();
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 max-w-4xl w-full bg-black shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Invoice Generator</h1>
        <div className="flex flex-col gap-4 w-full items-center">
          <div className="flex flex-col gap-4 w-full max-w-md">
            <input
              type="text"
              name="firstname"
              placeholder="First Name"
              className="border p-2 w-full rounded"
              onChange={handleChange}
              value={formData.firstname}
            />
            <input
              type="text"
              name="lastname"
              placeholder="Last Name"
              className="border p-2 w-full rounded"
              onChange={handleChange}
              value={formData.lastname}
            />
            <input
              type="phone"
              name="phone"
              placeholder="Phone"
              className="border p-2 w-full rounded"
              onChange={handleChange}
              value={formData.phone}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              className="border p-2 w-full rounded"
              onChange={handleChange}
              value={formData.address}
            />
            <div class="flex flex-col sm:flex-row gap-2 w-full justify-center items-center">
              <input
                type="text"
                name="postcode"
                placeholder="Post code"
                className="border p-2 w-full rounded"
                onChange={handleChange}
                value={formData.postcode}
              />
              <input
                type="text"
                name="town"
                placeholder="Town"
                className="border p-2 w-full rounded"
                onChange={handleChange}
                value={formData.town}
              />
            </div>
            <input
              type="date"
              name="date"
              className="border p-2 w-full rounded"
              onChange={handleChange}
              value={formData.date}
            />
            <div className="flex flex-col sm:flex-row gap-2 w-full justify-center items-center">
              <input
                type="text"
                name="description"
                placeholder="Product/Service"
                className="border p-2 w-full rounded"
                onChange={handleItemChange}
                value={newItem.description}
              />
              <input
                type="number"
                name="price"
                placeholder="Price (€)"
                className="border p-2 w-32 rounded"
                onChange={handleItemChange}
                value={newItem.price}
              />
              <button
                type="button"
                onClick={addItem}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
            <ul className="list-disc pl-5 w-full">
              {items.map((item, index) => (
                <li key={index} className="text-sm">
                  {item.description} - €{item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-right w-full">
              <p className="text-sm">Subtotal: {calculateSubtotal().toFixed(2)} €</p>
              <p className="text-sm">Tax (20%): {(calculateSubtotal() * TAX_RATE).toFixed(2)} €</p>
              <p className="font-semibold">Total: {(calculateSubtotal() * (1 + TAX_RATE)).toFixed(2)} €</p>
            </div>
            <button
              onClick={generatePDF}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
