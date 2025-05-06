/** @format */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../App';
import Swal from 'sweetalert2';

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

		const allMonths = Array.from({ length: currentMonth + 1 }, (_, i) => i);
		const unpaidMonths = allMonths.filter((m) => !paidMonthIndices.includes(m));
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
		<div className='space-y-8'>
			<div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
				<Link to='/owners'>
					<div className='bg-white p-6 rounded-xl shadow hover:shadow-lg transition'>
						<h3 className='text-xl font-semibold'>Room Owners</h3>
						<p className='text-gray-500'>Total: {totalOwners}</p>
					</div>
				</Link>

				<Link to='/owners'>
					<div className='bg-white p-6 rounded-xl shadow hover:shadow-lg transition'>
						<h3 className='text-xl font-semibold'>Monthly Rent Collection</h3>
						<p className='text-gray-500'>
							Total Collected: ₹{totalRentCollected}
						</p>
					</div>
				</Link>

				<Link to='/renovations'>
					<div className='bg-white p-6 rounded-xl shadow hover:shadow-lg transition'>
						<h3 className='text-xl font-semibold'>Room Renovation Costs</h3>
						<p className='text-gray-500'>Total Spent: ₹{totalRenovationCost}</p>
					</div>
				</Link>

				<div className='bg-white p-6 rounded-xl shadow'>
					<h3 className='text-xl font-semibold'>Revenue</h3>
					<p className='text-gray-500'>₹{totalRevenue}</p>
				</div>
			</div>

			<div className='bg-white p-6 rounded-xl shadow'>
				<h2 className='text-2xl font-bold mb-4'>Owner Rent Status</h2>
				<table className='min-w-full table-auto'>
					<thead className='bg-gray-200'>
						<tr>
							<th className='px-4 py-2 text-left'>Owner Name</th>
							<th className='px-4 py-2 text-left'>Total Paid</th>
							<th className='px-4 py-2 text-left'>Months Paid</th>
							<th className='px-4 py-2 text-left'>Paid Month Names</th>
							<th className='px-4 py-2 text-left'>Unpaid Months</th>
							<th className='px-4 py-2 text-left'>WhatsApp</th>
						</tr>
					</thead>
					<tbody>
						{owners.length === 0 ? (
							<tr>
								<td colSpan='6' className='text-center py-4 text-gray-500'>
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
										<tr className='border-t'>
											<td className='px-4 py-2'>{owner.name}</td>
											<td className='px-4 py-2'>₹{totalPaid}</td>
											<td className='px-4 py-2'>{paidMonths}</td>
											<td className='px-4 py-2 text-sm'>
												<button
													onClick={() =>
														setExpandedOwner(isExpanded ? null : owner.id)
													}
													className='text-blue-600 underline'>
													{isExpanded
														? 'Hide Months'
														: `Show (${paidMonthNames.length}) Months`}
												</button>
											</td>
											<td className='px-4 py-2'>
												<button
													onClick={() =>
														setExpandedOwner(isExpanded ? null : owner.id)
													}
													className='text-blue-600 underline'>
													{isExpanded
														? 'Hide Months'
														: `Show (${unpaidMonthNames.length}) Months`}
												</button>
											</td>
											<td className='px-4 py-2'>
												<button
													className='bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600'
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
														const currentUnpaid = unpaidMonthNames.filter((m) =>
															m.startsWith(months[currentMonthIndex])
														);
														const remainingUnpaid = unpaidMonthNames.filter(
															(m) => !m.startsWith(months[currentMonthIndex])
														);
														const message = `Dear ${
															owner.name
														}, you should pay for: ${currentUnpaid
															.concat(remainingUnpaid)
															.join(', ')} please pay as soon as possible.`;
														window.open(
															`https://wa.me/${
																owner.phone
															}?text=${encodeURIComponent(message)}`,
															'_blank'
														);
													}}>
													Send Message
												</button>
											</td>
										</tr>
										{isExpanded && (
											<tr className='bg-gray-100'>
												<td
													colSpan='6'
													className='px-4 py-2 text-sm text-blue-600'>
													<strong>Paid:</strong> {paidMonthNames.join(', ')}
													<br />
													<strong className='text-red-600'>Unpaid:</strong>{' '}
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
	);
}
