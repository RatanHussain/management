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
import { confirm } from 'react-confirm-box';
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
		<div className='space-y-6 max-w-7xl mx-auto pt-5'>
			<h2 className='text-2xl font-semibold text-gray-800'>
				Internet package Costs
			</h2>

			{/* Add Renovation Form */}
			<form
				onSubmit={handleAddRenovation}
				className='bg-white p-6 rounded-xl shadow-md max-w-full mx-auto space-y-6'>
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
			<div className='overflow-x-auto rounded-2xl shadow-2xl mx-auto text-center'>
				<table className='min-w-full bg-white border-separate border-spacing-y-2'>
					<thead className='bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 uppercase text-sm tracking-wide'>
						<tr>
							<th className=' px-6 py-3 hidden md:table-cell'>
								Room Number
							</th>
							<th  className=' px-6 py-3'>
								Date
							</th>
							<th  className=' px-6 py-3'>
								Description
							</th>
							<th  className='text-right px-6 py-3'>
								Amount (SR)
							</th>
							<th className=' px-6 py-3 hidden md:table-cell'>
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{renovations.map((entry) => (
							<tr
								key={entry.id}
								className='bg-white shadow-md rounded-xl hover:shadow-lg transition'>
								<td className='px-5 py-4 text-sm text-gray-800 hidden sm:table-cell'>
									<span className='inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium'>
										{entry.roomNumber}
									</span>
								</td>
								<td className='px-5 py-4 text-gray-800 text-sm'>
									{entry.date}
								</td>
								<td className='px-5 py-4 text-gray-800 text-sm'>
									{entry.description}
								</td>
								<td className='px-8 py-4 text-sm text-emerald-600 font-semibold'>
									SAR {entry.amount}
								</td>
								<td className='px-5 py-4 text-sm'>
									<button
										onClick={() => handleDelete(entry.id)}
										className='bg-red-500 text-white px-2 py-1.5 rounded-full hover:bg-red-600 transition hidden md:table-cell'>
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
