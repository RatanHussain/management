/** @format */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../App';
import Swal from 'sweetalert2';
import { Users, Wallet, Globe, BarChart2 } from 'lucide-react';

export default function Dashboard() {
	const [totalRenovationCost, setTotalRenovationCost] = useState(0);
	const [totalOwners, setTotalOwners] = useState(0);
	const [totalRentCollected, setTotalRentCollected] = useState(0);
	const [owners, setOwners] = useState([]);
	const [expandedOwner, setExpandedOwner] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			const renovationSnapshot = await getDocs(collection(db, 'renovations'));
			const renovationTotal = renovationSnapshot.docs.reduce(
				(sum, doc) => sum + (doc.data().amount || 0),
				0
			);
			setTotalRenovationCost(renovationTotal);

			const ownerSnapshot = await getDocs(collection(db, 'roomOwners'));
			const ownerList = ownerSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setOwners(ownerList);
			setTotalOwners(ownerList.length);

			const rentTotal = ownerList.reduce((sum, owner) => {
				return (
					sum +
					(owner.payments || []).reduce(
						(s, p) => s + (p.paid ? p.amount || 0 : 0),
						0
					)
				);
			}, 0);
			setTotalRentCollected(rentTotal);
		};

		fetchData();
	}, []);

	const getOwnerRentDetails = (owner) => {
		const months = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth();

		// Start from February, so adjust for the starting month
		const adjustedCurrentMonth = currentMonth === 0 ? 11 : currentMonth - 1; // If current month is January, use December from the previous year

		const payments = owner.payments || [];
		const paymentsThisYear = payments.filter((p) => {
			if (!p.month) return false;
			const date = new Date(p.month);
			return date.getFullYear() === currentYear && p.paid;
		});

		const paidMonthIndices = paymentsThisYear.map((p) =>
			new Date(p.month).getMonth()
		);
		const paidMonthNames = paidMonthIndices.map(
			(m) => `${months[m]}-${currentYear}`
		);

		// Adjust the range to exclude January (start from February)
		const allMonths = Array.from(
			{ length: adjustedCurrentMonth },
			(_, i) => i + 1
		);
		const unpaidMonths = allMonths.filter((m) => !paidMonthIndices.includes(m));

		// Always include the current month as unpaid if it's not already paid
		if (!paidMonthIndices.includes(currentMonth)) {
			unpaidMonths.push(currentMonth);
		}

		const unpaidMonthNames = unpaidMonths.map(
			(m) => `${months[m]}-${currentYear}`
		);

		const totalPaid = paymentsThisYear.reduce(
			(sum, p) => sum + (p.amount || 0),
			0
		);

		return {
			totalPaid,
			paidMonths: paidMonthIndices.length,
			paidMonthNames,
			unpaidMonthNames,
		};
	};

	const totalRevenue = totalRentCollected - totalRenovationCost;

	return (
		<div className='space-y-8 pt-5'>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				{/* All Users */}
				<Link to='/owners'>
					<div className='bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-2xl shadow-md hover:shadow-xl transform transition duration-200 hover:scale-[1.03]'>
						<div className='flex items-center justify-between'>
							<div>
								<h3 className='text-xl font-bold text-white mb-1'>All Users</h3>
								<p className='text-blue-100'>Total: {totalOwners}</p>
							</div>
							<Users className='text-white' size={32} />
						</div>
					</div>
				</Link>

				{/* Monthly Revenue Collected */}
				<Link to='/owners'>
					<div className='bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-2xl shadow-md hover:shadow-xl transform transition duration-200 hover:scale-[1.03]'>
						<div className='flex items-center justify-between'>
							<div>
								<h3 className='text-xl font-bold text-white mb-1'>
									Monthly Revenue
								</h3>
								<p className='text-emerald-100'>SAR {totalRentCollected}</p>
							</div>
							<Wallet className='text-white' size={32} />
						</div>
					</div>
				</Link>

				{/* Internet Package (Expenses) */}
				<Link to='/renovations'>
					<div className='bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-2xl shadow-md hover:shadow-xl transform transition duration-200 hover:scale-[1.03]'>
						<div className='flex items-center justify-between'>
							<div>
								<h3 className='text-xl font-bold text-white mb-1'>
									Internet Expenses
								</h3>
								<p className='text-yellow-100'>SAR {totalRenovationCost}</p>
							</div>
							<Globe className='text-white' size={32} />
						</div>
					</div>
				</Link>

				{/* Net Revenue */}
				<div className='bg-gradient-to-br from-rose-500 to-rose-700 p-6 rounded-2xl shadow-md hover:shadow-xl transform transition duration-200 hover:scale-[1.03]'>
					<div className='flex items-center justify-between'>
						<div>
							<h3 className='text-xl font-bold text-white mb-1'>Net Revenue</h3>
							<p className='text-rose-100'>SAR {totalRevenue}</p>
						</div>
						<BarChart2 className='text-white' size={32} />
					</div>
				</div>
			</div>

			<div className='bg-white p-6 rounded-2xl shadow-xl'>
				<h2 className='text-3xl font-bold text-gray-800 mb-6'>User Status</h2>
				<div className='overflow-x-auto'>
					<table className='min-w-full border-separate border-spacing-y-2'>
						<thead className='bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg'>
							<tr className='text-left'>
								<th className='px-6 py-3 text-xs font-semibold text-gray-600 uppercase'>
									User Name
								</th>
								<th className='px-6 py-3 text-xs font-semibold text-gray-600 uppercase hidden md:table-cell'>
									Total Paid
								</th>
								<th className='px-6 py-3 text-xs font-semibold text-gray-600 uppercase hidden md:table-cell'>
									Months Paid
								</th>
								<th className='px-6 py-3 text-xs font-semibold text-gray-600 uppercase hidden md:table-cell'>
									Paid Months
								</th>
								<th className='px-6 py-3 text-xs font-semibold text-gray-600 uppercase'>
									Unpaid Months
								</th>
								<th className='px-6 py-3 text-xs font-semibold text-gray-600 uppercase'>
									WhatsApp
								</th>
							</tr>
						</thead>
						<tbody>
							{owners.length === 0 ? (
								<tr>
									<td colSpan='6' className='text-center py-6 text-gray-500'>
										No owner data available.
									</td>
								</tr>
							) : (
								owners.map((owner) => {
									const {
										totalPaid,
										paidMonths,
										paidMonthNames,
										unpaidMonthNames,
									} = getOwnerRentDetails(owner);
									const isExpanded = expandedOwner === owner.id;
									return (
										<React.Fragment key={owner.id}>
											<tr className='bg-white shadow-sm hover:shadow-md transition rounded-lg'>
												<td className='px-6 py-4 text-sm text-gray-800'>
													{owner.name}
												</td>
												<td className='px-6 py-4 text-sm text-green-600 font-medium hidden md:table-cell'>
													SAR {totalPaid}
												</td>
												<td className='px-6 py-4 text-sm text-gray-700 hidden md:table-cell'>
													{paidMonths}
												</td>
												<td className='px-6 py-4 text-sm hidden md:table-cell'>
													<button
														onClick={() =>
															setExpandedOwner(isExpanded ? null : owner.id)
														}
														className='text-indigo-600 hover:underline'>
														{isExpanded
															? 'Hide Months'
															: `Show (${paidMonthNames.length}) Months`}
													</button>
												</td>
												<td className='px-6 py-4 text-sm'>
													<button
														onClick={() =>
															setExpandedOwner(isExpanded ? null : owner.id)
														}
														className='text-red-600 hover:underline'>
														{isExpanded
															? 'Hide Months'
															: `Show (${unpaidMonthNames.length}) Months`}
													</button>
												</td>
												<td className='px-6 py-4'>
													<button
														className='bg-emerald-500 text-white px-4 py-2 rounded-full shadow hover:bg-emerald-600 transition'
														onClick={() => {
															const currentMonthIndex = new Date().getMonth();
															const months = [
																'Jan',
																'Feb',
																'Mar',
																'Apr',
																'May',
																'Jun',
																'Jul',
																'Aug',
																'Sep',
																'Oct',
																'Nov',
																'Dec',
															];
															const currentUnpaid = unpaidMonthNames.filter(
																(m) => m.startsWith(months[currentMonthIndex])
															);
															const remainingUnpaid = unpaidMonthNames.filter(
																(m) => !m.startsWith(months[currentMonthIndex])
															);
															const message = `Dear ${
																owner.name
															}, you should pay for: ${currentUnpaid
																.concat(remainingUnpaid)
																.join(', ')}. Please pay as soon as possible.`;
															window.open(
																`https://wa.me/${
																	owner.phone
																}?text=${encodeURIComponent(message)}`,
																'_blank'
															);
														}}>
														Send
													</button>
												</td>
											</tr>
											{isExpanded && (
												<tr className='bg-gray-50'>
													<td
														colSpan='6'
														className='px-6 py-3 text-sm text-gray-700'>
														<strong className='text-green-600'>Paid:</strong>{' '}
														{paidMonthNames.join(', ')} <br />
														<strong className='text-red-600'>
															Unpaid:
														</strong>{' '}
														{unpaidMonthNames.join(', ')}
													</td>
												</tr>
											)}
										</React.Fragment>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
