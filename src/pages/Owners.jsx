/** @format */

import React, { useEffect, useState } from 'react';
import {
	collection,
	getDocs,
	doc,
	deleteDoc,
	updateDoc,
	arrayUnion,
	addDoc,
} from 'firebase/firestore';
import { db } from '../App';
import { confirm } from 'react-confirm-box';
import Swal from 'sweetalert2';

export default function Owners() {
	const [owners, setOwners] = useState([]);
	const [selectedOwnerId, setSelectedOwnerId] = useState(null);
	const [form, setForm] = useState({ month: '', amount: '', paid: 'true' });
	const [newOwner, setNewOwner] = useState({
		name: '',
		roomNumber: '',
		phone: '',
	});

	useEffect(() => {
		const fetchOwners = async () => {
			const querySnapshot = await getDocs(collection(db, 'roomOwners'));
			const ownersList = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setOwners(ownersList);
		};

		fetchOwners();
	}, []);

	const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the owner.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            await deleteDoc(doc(db, 'roomOwners', id));
            setOwners((prev) => prev.filter((owner) => owner.id !== id));

            Swal.fire('Deleted!', 'Owner has been removed.', 'success');
        }
    };


	const addPayment = async (ownerId, newPayment) => {
		const ref = doc(db, 'roomOwners', ownerId);
		await updateDoc(ref, {
			payments: arrayUnion(newPayment),
		});
		setOwners((prev) =>
			prev.map((owner) =>
				owner.id === ownerId
					? { ...owner, payments: [...(owner.payments || []), newPayment] }
					: owner
			)
		);
		setForm({ month: '', amount: '', paid: 'true' });
		setSelectedOwnerId(null);
	};

	const addNewOwner = async (e) => {
		e.preventDefault();
		const docRef = await addDoc(collection(db, 'roomOwners'), {
			...newOwner,
			payments: [],
		});
		setOwners([...owners, { id: docRef.id, ...newOwner, payments: [] }]);
		setNewOwner({ name: '', roomNumber: '', phone: '' });
	};

	return (
		<div className='space-y-4'>
			<h2 className='text-2xl font-bold'>Room Owners</h2>

			{/* Add Owner Form */}
			<form
				onSubmit={addNewOwner}
				className='bg-white p-4 rounded-2xl shadow space-y-4 max-w-xl'>
				<h3 className='text-lg font-semibold'>Add New Owner</h3>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<input
						type='text'
						placeholder='Name'
						value={newOwner.name}
						onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
						className='border rounded px-3 py-2'
						required
					/>
					<input
						type='text'
						placeholder='Room Number'
						value={newOwner.roomNumber}
						onChange={(e) =>
							setNewOwner({ ...newOwner, roomNumber: e.target.value })
						}
						className='border rounded px-3 py-2'
						required
					/>
					<input
						type='text'
						placeholder='Phone'
						value={newOwner.phone}
						onChange={(e) =>
							setNewOwner({ ...newOwner, phone: e.target.value })
						}
						className='border rounded px-3 py-2'
						required
					/>
				</div>
				<button
					type='submit'
					className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'>
					Add Owner
				</button>
			</form>

			{/* Owner Table */}
			<div className='overflow-x-auto'>
				<table className='min-w-full bg-white shadow rounded-2xl'>
					<thead className='bg-gray-200'>
						<tr>
							<th className='text-left px-4 py-2'>Name</th>
							<th className='text-left px-4 py-2'>Room Number</th>
							<th className='text-left px-4 py-2'>Phone</th>
							<th className='text-left px-4 py-2'>Rent History</th>
							<th className='text-left px-4 py-2'>Actions</th>
						</tr>
					</thead>
					<tbody>
						{owners.map((owner) => (
							<tr key={owner.id} className='border-t'>
								<td className='px-4 py-2 align-top'>{owner.name}</td>
								<td className='px-4 py-2 align-top'>{owner.roomNumber}</td>
								<td className='px-4 py-2 align-top'>{owner.phone}</td>
								<td className='px-4 py-2 text-sm align-top'>
									{(owner.payments || []).map((p, idx) => (
										<div key={idx}>
											{p.month}: ₹{p.amount} – {p.paid ? '✅' : '❌'}
										</div>
									))}
								</td>
								<td className='px-4 py-2 align-top space-y-2'>
									<button
										className='text-red-600 hover:underline block'
										onClick={() => handleDelete(owner.id)}>
										Delete
									</button>
									<button
										className='text-blue-600 hover:underline block'
										onClick={() => setSelectedOwnerId(owner.id)}>
										Add Rent
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Add Payment Form */}
			{selectedOwnerId && (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						addPayment(selectedOwnerId, {
							month: form.month,
							amount: Number(form.amount),
							paid: form.paid === 'true',
						});
					}}
					className='bg-white p-4 rounded-2xl shadow space-y-4 max-w-md'>
					<h3 className='text-lg font-semibold'>Add Rent Payment</h3>
					<div>
						<label className='block text-sm font-medium'>Month</label>
						<input
							type='month'
							value={form.month}
							onChange={(e) => setForm({ ...form, month: e.target.value })}
							className='w-full border rounded px-3 py-2 mt-1'
							required
						/>
					</div>
					<div>
						<label className='block text-sm font-medium'>Amount</label>
						<input
							type='number'
							value={form.amount}
							onChange={(e) => setForm({ ...form, amount: e.target.value })}
							className='w-full border rounded px-3 py-2 mt-1'
							required
						/>
					</div>
					<div>
						<label className='block text-sm font-medium'>Paid Status</label>
						<select
							value={form.paid}
							onChange={(e) => setForm({ ...form, paid: e.target.value })}
							className='w-full border rounded px-3 py-2 mt-1'>
							<option value='true'>Paid</option>
							<option value='false'>Unpaid</option>
						</select>
					</div>
					<div className='flex justify-between'>
						<button
							type='submit'
							className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
							Save Payment
						</button>
						<button
							type='button'
							onClick={() => setSelectedOwnerId(null)}
							className='text-gray-600 hover:underline'>
							Cancel
						</button>
					</div>
				</form>
			)}
		</div>
	);
}
