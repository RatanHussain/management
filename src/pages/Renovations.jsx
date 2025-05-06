import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../App";
import { confirm } from "react-confirm-box";
import Swal from "sweetalert2";

export default function Renovations() {
  const [renovations, setRenovations] = useState([]);
  const [newRenovation, setNewRenovation] = useState({ roomNumber: "", date: "", description: "", amount: "" });

  useEffect(() => {
    const fetchRenovations = async () => {
      const snapshot = await getDocs(collection(db, "renovations"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRenovations(list);
    };
    fetchRenovations();
  }, []);

  const handleAddRenovation = async (e) => {
    e.preventDefault();
    const docRef = await addDoc(collection(db, "renovations"), {
      ...newRenovation,
      amount: Number(newRenovation.amount)
    });
    setRenovations([...renovations, { id: docRef.id, ...newRenovation }]);
    setNewRenovation({ roomNumber: "", date: "", description: "", amount: "" });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the renovation entry.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      await deleteDoc(doc(db, "renovations", id));
      setRenovations((prev) => prev.filter((r) => r.id !== id));
      Swal.fire("Deleted!", "The entry has been removed.", "success");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Room Renovation Costs</h2>

      {/* Add Renovation Form */}
      <form onSubmit={handleAddRenovation} className="bg-white p-4 rounded-2xl shadow space-y-4 max-w-xl">
        <h3 className="text-lg font-semibold">Add Renovation Entry</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Room Number"
            value={newRenovation.roomNumber}
            onChange={(e) => setNewRenovation({ ...newRenovation, roomNumber: e.target.value })}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="date"
            value={newRenovation.date}
            onChange={(e) => setNewRenovation({ ...newRenovation, date: e.target.value })}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newRenovation.description}
            onChange={(e) => setNewRenovation({ ...newRenovation, description: e.target.value })}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={newRenovation.amount}
            onChange={(e) => setNewRenovation({ ...newRenovation, amount: e.target.value })}
            className="border rounded px-3 py-2"
            required
          />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Add Entry
        </button>
      </form>

      {/* Renovation List */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-2xl">
          <thead className="bg-gray-200">
            <tr>
              <th className="text-left px-4 py-2">Room Number</th>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Description</th>
              <th className="text-left px-4 py-2">Amount (₹)</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {renovations.map((entry) => (
              <tr key={entry.id} className="border-t">
                <td className="px-4 py-2">{entry.roomNumber}</td>
                <td className="px-4 py-2">{entry.date}</td>
                <td className="px-4 py-2">{entry.description}</td>
                <td className="px-4 py-2">₹{entry.amount}</td>
                <td className="px-4 py-2">
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
