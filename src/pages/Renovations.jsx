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
	const [epenseForm, setepenseForm] = useState(false);
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
		<div className='max-w-7xl mx-auto py-6 space-y-8'>
			<h2 className='text-2xl  text-gray-800'>Package Cost</h2>

			{/* Add Renovation Form */}
			<button
				onClick={() => setepenseForm(!epenseForm)}
				className={`w-full py-2 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700 transition ${
					epenseForm ? 'hidden' : ''
				}`}>
				Add Expense
			</button>
			{epenseForm && (
				<form
					onSubmit={handleAddRenovation}
					className='bg-white p-6 rounded-2xl shadow-xl space-y-4'>
					<h3 className='text-2xl font-semibold text-gray-800'>Add Expense</h3>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
						<input
							type='text'
							placeholder='Room Number'
							value={newRenovation.roomNumber}
							onChange={(e) =>
								setNewRenovation({
									...newRenovation,
									roomNumber: e.target.value,
								})
							}
							className='border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
						<input
							type='date'
							value={newRenovation.date}
							onChange={(e) =>
								setNewRenovation({ ...newRenovation, date: e.target.value })
							}
							className='border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
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
							className='border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
						<input
							type='number'
							placeholder='Amount'
							value={newRenovation.amount}
							onChange={(e) =>
								setNewRenovation({ ...newRenovation, amount: e.target.value })
							}
							className='border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
							required
						/>
					</div>
					<div className='flex justify-between items-center mt-4'>
						<button
							type='submit'
							className='bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 transition'>
							Add
						</button>
						<button
							onClick={() => setepenseForm(false)}
							className='me-1 pe-1 text-gray-600 hover:underline'>
							Cancel
						</button>
					</div>
				</form>
			)}
			{/* Add Renovation Form End */}

			{/* Renovation List */}
			<div className='bg-white p-4 rounded-2xl shadow-xl overflow-x-auto'>
				<table className='min-w-full divide-y divide-gray-200'>
					<thead className='bg-gray-100'>
						<tr>
							<th className='px-6 hidden md:table-cell py-3 text-left text-sm font-semibold text-gray-700'>
								Room
							</th>
							<th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
								Date
							</th>
							<th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
								Description
							</th>
							<th className='px-6 py-3 text-right text-sm font-semibold text-gray-700'>
								Amount
							</th>
							<th className='px-6 hidden md:table-cell py-3 text-center text-sm font-semibold text-gray-700'>
								Action
							</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-100'>
						{renovations.map((entry) => (
							<tr key={entry.id} className='hover:bg-gray-50'>
								<td className='px-6 hidden md:table-cell py-4 text-sm text-gray-800'>
									{entry.roomNumber}
								</td>
								<td className='px-6 py-4 text-sm text-gray-600'>
									{entry.date}
								</td>
								<td className='px-6 py-4 text-sm text-gray-600'>
									{entry.description}
								</td>
								<td className='px-6 py-4 text-right text-sm font-medium text-emerald-600'>
									{entry.amount}
								</td>
								<td className='px-6 hidden md:table-cell py-4 text-center'>
									<button
										onClick={() => handleDelete(entry.id)}
										className='text-red-600 hover:text-red-800 font-medium'>
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
