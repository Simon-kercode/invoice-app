// Vite + React + pdf-lib
import { useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";

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

  const TAX_RATE = 0.2;

  const generatePDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    page.drawText("Invoice", {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0.8),
    });

    page.drawText(`Client: ${formData.firstname} ${formData.lastname}`, {
      x: 50,
      y: height - 90,
      size: 14,
    });

    page.drawText(`Phone number: ${formData.phone}`, {
      x: 50,
      y: height - 110,
      size: 14,
    });

    page.drawText(`Address: ${formData.address}`, {
      x: 50,
      y: height - 130,
      size: 14,
    });

    page.drawText(`${formData.postcode} ${formData.town}`, {
      x: 50,
      y: height - 150,
      size: 14,
    });

    page.drawText(`Date: ${formData.date}`, {
      x: 50,
      y: height - 170,
      size: 14,
    });

    let y = height - 210;
    page.drawText("Items:", { x: 50, y, size: 14 });
    y -= 20;
    items.forEach((item, index) => {
      page.drawText(`${index + 1}. ${item.description} - €${item.price.toFixed(2)}`, {
        x: 60,
        y,
        size: 12,
      });
      y -= 20;
    });

    const subtotal = calculateSubtotal();
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    y -= 10;
    page.drawText(`Subtotal: €${subtotal.toFixed(2)}`, { x: 50, y, size: 14 });
    y -= 20;
    page.drawText(`Tax (20%): €${tax.toFixed(2)}`, { x: 50, y, size: 14 });
    y -= 20;
    page.drawText(`Total: €${total.toFixed(2)}`, { x: 50, y, size: 14 });

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "invoice.pdf";
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
              type="tephone"
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
              <p className="text-sm">Subtotal: €{calculateSubtotal().toFixed(2)}</p>
              <p className="text-sm">Tax (20%): €{(calculateSubtotal() * TAX_RATE).toFixed(2)}</p>
              <p className="font-semibold">Total: €{(calculateSubtotal() * (1 + TAX_RATE)).toFixed(2)}</p>
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
