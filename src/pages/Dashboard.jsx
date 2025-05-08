/** @format */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../App';
import Swal from 'sweetalert2';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
	Legend,
} from 'recharts';
import {
	BarChart2,
	Globe,
	Users,
	Wallet,
	ChartNoAxesCombined,
} from 'lucide-react';

export default function Dashboard() {
	const [totalRenovationCost, setTotalRenovationCost] = useState(0);
	const [totalOwners, setTotalOwners] = useState(0);
	const [totalRentCollected, setTotalRentCollected] = useState(0);
	const [owners, setOwners] = useState([]);
	const [expandedOwner, setExpandedOwner] = useState(null);
	const [renovationData, setRenovationData] = useState([]);

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
			const renovationList = renovationSnapshot.docs.map((doc) => ({
				...doc.data(),
			}));
			setRenovationData(renovationList);
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

		const payments = owner.payments || [];

		// Use 'joinDate' key
		const joiningDateStr = owner.joinDate;
		if (!joiningDateStr)
			return {
				totalPaid: 0,
				paidMonths: 0,
				paidMonthNames: [],
				unpaidMonthNames: [],
			};

		const joiningDate = new Date(`${joiningDateStr}-01`);
		const now = new Date();
		const allMonthDates = [];
		const format = (date) => `${months[date.getMonth()]}-${date.getFullYear()}`;

		const date = new Date(joiningDate);
		while (date <= now) {
			allMonthDates.push(new Date(date));
			date.setMonth(date.getMonth() + 1);
		}

		const paidMonths = new Set(
			payments
				.filter((p) => p.paid && p.month)
				.map((p) => {
					try {
						const d = new Date(`${p.month}-01`);
						return `${d.getFullYear()}-${d.getMonth()}`;
					} catch {
						return null;
					}
				})
				.filter(Boolean)
		);

		const paidMonthNames = [];
		const unpaidMonthNames = [];

		for (let m of allMonthDates) {
			const key = `${m.getFullYear()}-${m.getMonth()}`;
			if (paidMonths.has(key)) {
				paidMonthNames.push(format(m));
			} else {
				unpaidMonthNames.push(format(m));
			}
		}

		const totalPaid = payments
			.filter((p) => p.paid)
			.reduce((sum, p) => sum + (p.amount || 0), 0);

		return {
			totalPaid,
			paidMonths: paidMonthNames.length,
			paidMonthNames,
			unpaidMonthNames,
		};
	};

	const totalRevenue = totalRentCollected - totalRenovationCost;

	const getChartData = (owners, renovations) => {
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
		const monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
			month: months[i],
			rent: 0,
			renovation: 0,
		}));

		owners.forEach((owner) => {
			(owner.payments || []).forEach((p) => {
				if (p.paid && p.month) {
					const date = new Date(p.month);
					const monthIdx = date.getMonth();
					monthlyTotals[monthIdx].rent += p.amount || 0;
				}
			});
		});

		renovations.forEach((r) => {
			if (r.date && r.amount) {
				const date = new Date(r.date); // Make sure 'date' in Firestore is a parsable string or Timestamp
				const monthIdx = date.getMonth();
				monthlyTotals[monthIdx].renovation += r.amount || 0;
			}
		});

		return monthlyTotals;
	};

	return (
		<div className='space-y-8  pt-5'>
			{/* Summary Section */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				{/* Total Users Card */}
				<Link to='/User'>
					<div className='bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-2xl shadow-md hover:shadow-xl transform transition duration-200 hover:scale-[1.03]'>
						<div className='flex items-center justify-between'>
							<div>
								<h3 className='text-xl font-bold text-white mb-1'>
									Total Users
								</h3>
								<p className='text-blue-100'>{totalOwners}</p>
							</div>
							<Users className='text-white' size={32} />
						</div>
					</div>
				</Link>

				{/* Monthly Revenue Collected */}
				<Link to='/user'>
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
						<ChartNoAxesCombined className='text-white' size={32} />
					</div>
				</div>
			</div>

			{/* User Status Table */}
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
									Paid Month Names
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
																.join(', ')} please pay as soon as possible.`;
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
														<strong>Paid:</strong> {paidMonthNames.join(', ')}
														<br />
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

				{/* Monthly Revenue Chart */}
				<div className='bg-white p-6 rounded-2xl shadow-xl mt-8'>
					<h2 className='text-2xl font-bold text-gray-800 mb-4'>
						Monthly Revenue Overview
					</h2>
					<ResponsiveContainer width='100%' height={300}>
						<LineChart
							data={getChartData(owners, renovationData)}
							margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis dataKey='month' />
							<YAxis />
							<Tooltip />
							<Legend />
							<Line
								type='monotone'
								dataKey='rent'
								stroke='#10B981'
								name='Payment Received'
							/>
							<Line
								type='monotone'
								dataKey='renovation'
								stroke='#F59E0B'
								name='Expenses (Internet)'
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
