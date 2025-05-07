/** @format */

import React, { useEffect, useState } from 'react';
import {
	collection,
	getDocs,
	addDoc,
	deleteDoc,
	doc,
} from 'firebase/firestore';
import { db } from '../App';
import Swal from 'sweetalert2';

export default function Renovations() {
	const [renovations, setRenovations] = useState([]);
	const [newRenovation, setNewRenovation] = useState({
		roomNumber: '',
		date: '',
		description: '',
		amount: '',
	});

	useEffect(() => {
		const fetchRenovations = async () => {
			const snapshot = await getDocs(collection(db, 'renovations'));
			const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			setRenovations(list);
		};
		fetchRenovations();
	}, []);

	const handleAddRenovation = async (e) => {
		e.preventDefault();
		const docRef = await addDoc(collection(db, 'renovations'), {
			...newRenovation,
			amount: Number(newRenovation.amount),
		});
		setRenovations([...renovations, { id: docRef.id, ...newRenovation }]);
		setNewRenovation({ roomNumber: '', date: '', description: '', amount: '' });
	};

	const handleDelete = async (id) => {
		const result = await Swal.fire({
			title: 'Are you sure?',
			text: 'This will permanently delete the renovation entry.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#3085d6',
			confirmButtonText: 'Yes, delete it!',
		});

		if (result.isConfirmed) {
			await deleteDoc(doc(db, 'renovations', id));
			setRenovations((prev) => prev.filter((r) => r.id !== id));
			Swal.fire('Deleted!', 'The entry has been removed.', 'success');
		}
	};

	return (
		<div className='space-y-6 pt-5'>
			<h2 className='text-2xl font-semibold text-gray-800'>
				Internet package Costs
			</h2>

			{/* Add Renovation Form */}
			<form
				onSubmit={handleAddRenovation}
				className='bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto space-y-6'>
				<h3 className='text-xl font-semibold text-gray-700'>Add Expenses</h3>
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
					<input
						type='text'
						placeholder='Room Number'
						value={newRenovation.roomNumber}
						onChange={(e) =>
							setNewRenovation({ ...newRenovation, roomNumber: e.target.value })
						}
						className='border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500'
						required
					/>
					<input
						type='date'
						value={newRenovation.date}
						onChange={(e) =>
							setNewRenovation({ ...newRenovation, date: e.target.value })
						}
						className='border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500'
						required
					/>
					<input
						type='text'
						placeholder='Description'
						value={newRenovation.description}
						onChange={(e) =>
							setNewRenovation({
								...newRenovation,
								description: e.target.value,
							})
						}
						className='border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500'
						required
					/>
					<input
						type='number'
						placeholder='Amount'
						value={newRenovation.amount}
						onChange={(e) =>
							setNewRenovation({ ...newRenovation, amount: e.target.value })
						}
						className='border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500'
						required
					/>
				</div>
				<button
					type='submit'
					className='w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none'>
					Add Expenses
				</button>
			</form>

			{/* Renovation List */}
			<div className='overflow-x-auto'>
				<table className='min-w-full bg-white rounded-2xl shadow-xl border-separate border-spacing-y-2'>
					<thead className='bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700'>
						<tr>
							<th className='text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell'>
								Room
							</th>
							<th className='text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider'>
								Date
							</th>
							<th className='text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider'>
								Descrp*
							</th>
							<th className='text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider'>
								Amount
							</th>
							<th className='text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider'>
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{renovations.map((entry) => (
							<tr
								key={entry.id}
								className='bg-white shadow hover:shadow-md transition rounded-lg'>
								<td className='px-5 py-4 text-sm text-gray-800 hidden sm:table-cell'>
									<span className='inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium'>
										{entry.roomNumber}
									</span>
								</td>
								<td className='px-5 py-4 text-sm text-gray-700'>
									{entry.date}
								</td>
								<td className='px-5 py-4 text-sm text-gray-700'>
									{entry.description}
								</td>
								<td className='px-5 py-4 text-sm text-emerald-600 font-semibold'>
									SAR {entry.amount}
								</td>
								<td className='px-5 py-4 text-sm'>
									<button
										onClick={() => handleDelete(entry.id)}
										className='bg-red-500 text-white px-2 py-1.5 rounded-full hover:bg-red-600 transition'>
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
