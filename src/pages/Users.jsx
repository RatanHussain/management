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
import Swal from 'sweetalert2';

export default function Owners() {
	const [owners, setOwners] = useState([]);
	const [selectedOwnerId, setSelectedOwnerId] = useState(null);
	const [form, setForm] = useState({ month: '', amount: '', paid: 'true' });
	const [newOwner, setNewOwner] = useState({
		name: '',
		roomNumber: '',
		phone: '',
		joinDate: '',
	});
	const [expandedOwnerId, setExpandedOwnerId] = useState(null);

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

	const getMonthsSinceJoin = (joinMonth) => {
		const [joinYear, joinMon] = joinMonth.split('-').map(Number);
		const now = new Date();
		const months = [];
		const start = new Date(joinYear, joinMon - 1);
		while (start <= now) {
			const monthStr = start.toISOString().slice(0, 7);
			months.push(monthStr);
			start.setMonth(start.getMonth() + 1);
		}
		return months;
	};

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
					? {
							...owner,
							payments: [...(owner.payments || []), newPayment],
					  }
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
		setNewOwner({ name: '', roomNumber: '', phone: '', joinDate: '' });
	};

	return (
		<div className='space-y-6 max-w-7xl mx-auto md:p-8'>
			<h2 className='text-2xl  text-gray-800'>User details</h2>

			{/* Add Owner Form */}
			<form
				onSubmit={addNewOwner}
				className='bg-white p-6 rounded-2xl shadow-xl space-y-4'>
				<h3 className='text-xl font-semibold text-gray-700'>Add New User</h3>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<input
						type='text'
						placeholder='Name'
						value={newOwner.name}
						onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
						className='border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						required
					/>
					<input
						type='text'
						placeholder='Room Number'
						value={newOwner.roomNumber}
						onChange={(e) =>
							setNewOwner({ ...newOwner, roomNumber: e.target.value })
						}
						className='border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						required
					/>
					<input
						type='text'
						placeholder='Phone'
						value={newOwner.phone}
						onChange={(e) =>
							setNewOwner({ ...newOwner, phone: e.target.value })
						}
						className='border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						required
					/>
					<input
						type='month'
						placeholder='Join Date'
						value={newOwner.joinDate}
						onChange={(e) =>
							setNewOwner({ ...newOwner, joinDate: e.target.value })
						}
						className='border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						required
					/>
				</div>
				<button
					type='submit'
					className='bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition'>
					Add User
				</button>
			</form>

			{/* Owner Table */}
			<div className='overflow-x-auto rounded-2xl shadow-2xl'>
				<table className='min-w-full bg-white border-separate border-spacing-y-2'>
					<thead className='bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 uppercase text-sm tracking-wide'>
						<tr>
							<th className='text-left px-6 py-3'>User Name</th>
							<th className='text-left px-6 py-3 hidden md:table-cell'>
								Room No
							</th>
							<th className='text-left px-6 py-3 hidden md:table-cell'>
								Phone
							</th>
							<th className='text-left px-6 py-3'>History</th>
							<th className='text-left px-6 py-3'>Actions</th>
						</tr>
					</thead>
					<tbody>
						{owners.map((owner) => {
							const paidMonths =
								owner.payments?.filter((p) => p.paid).map((p) => p.month) || [];
							const expectedMonths = getMonthsSinceJoin(owner.joinDate);
							const unpaidMonths = expectedMonths.filter(
								(m) => !paidMonths.includes(m)
							);
							return (
								<tr
									key={owner.id}
									className='bg-white shadow-md rounded-xl hover:shadow-lg transition'>
									<td className='px-6 py-4 text-gray-800 font-medium'>
										{owner.name}
									</td>
									<td className='px-6 py-4 hidden md:table-cell'>
										<span className='bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold'>
											{owner.roomNumber}
										</span>
									</td>
									<td className='px-6 py-4 hidden md:table-cell text-gray-700 text-sm'>
										<a
											href={`tel:${owner.phone}`}
											className='hover:text-blue-600'>
											{owner.phone}
										</a>
									</td>
									<td className='px-6 py-4 text-sm'>
										<button
											onClick={() =>
												expandedOwnerId === owner.id
													? setExpandedOwnerId(null)
													: setExpandedOwnerId(owner.id)
											}
											className='text-blue-600 hover:underline font-medium'>
											{expandedOwnerId === owner.id ? 'Hide' : 'Show'}
										</button>
										{expandedOwnerId === owner.id && (
											<div className='mt-3 text-xs text-gray-700 space-y-1'>
												{(owner.payments || []).length > 0 ? (
													owner.payments.map((p, idx) => (
														<div key={idx} className='flex items-center gap-2'>
															<span className='font-medium'>{p.month}:</span>
															<span>SAR {p.amount}</span>
															<span
																className={
																	p.paid ? 'text-green-600' : 'text-red-600'
																}>
																{p.paid ? '✅ Paid' : '❌ Unpaid'}
															</span>
														</div>
													))
												) : (
													<div className='text-gray-500 italic'>
														No payments found
													</div>
												)}
											</div>
										)}
									</td>
									<td className='px-6 py-4 space-y-2 text-sm'>
										<button
											onClick={() => handleDelete(owner.id)}
											className='bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition hidden md:table-cell'>
											Delete
										</button>
										<button
											onClick={() => setSelectedOwnerId(owner.id)}
											className='bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition'>
											Add Rent
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Add Payment Modal */}
			{selectedOwnerId && (
				<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							addPayment(selectedOwnerId, {
								month: form.month,
								amount: Number(form.amount),
								paid: form.paid === 'true',
							});
						}}
						className='bg-white p-6 rounded-2xl shadow-2xl space-y-4 w-full max-w-md animate-fade-in-up'>
						<h3 className='text-lg font-semibold text-gray-800'>
							Add Rent Payment
						</h3>
						<div>
							<label className='block text-sm font-medium text-gray-600'>
								Month
							</label>
							<input
								type='month'
								value={form.month}
								onChange={(e) => setForm({ ...form, month: e.target.value })}
								className='w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-600'>
								Amount
							</label>
							<input
								type='number'
								value={form.amount}
								onChange={(e) => setForm({ ...form, amount: e.target.value })}
								className='w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-600'>
								Paid Status
							</label>
							<select
								value={form.paid}
								onChange={(e) => setForm({ ...form, paid: e.target.value })}
								className='w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500'>
								<option value='true'>Paid</option>
								<option value='false'>Unpaid</option>
							</select>
						</div>
						<div className='flex justify-between pt-2'>
							<button
								type='submit'
								className='bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition'>
								Save
							</button>
							<button
								type='button'
								onClick={() => setSelectedOwnerId(null)}
								className='text-gray-600 hover:underline'>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}
