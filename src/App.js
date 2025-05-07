/** @format */

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import User from './pages/Users';
import Renovations from './pages/Renovations';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { Home, Users, Wrench } from 'lucide-react';

// Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyAA3e28wb4kjpN5G8KQoaX5BvZsb9Vkdpk',
	authDomain: 'management-7395.firebaseapp.com',
	projectId: 'management-7395',
	storageBucket: 'management-7395.firebasestorage.app',
	messagingSenderId: '556256912841',
	appId: '1:556256912841:web:0714799cbdba3d7827b418',
	measurementId: 'G-JNL3YPF01D',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

export default function App() {
	return (
		<Router>
			<div className='min-h-screen bg-gray-100'>
				{/* Navbar */}
				<nav className='bg-white shadow-md fixed top-0 pb-4 pt-2 left-0 w-full z-10'>
					<div className='max-w-7xl mx-auto px-4 h-20 flex flex-col sm:flex-row items-center justify-between'>
						{/* Logo or Title */}
						<h1 className='text-2xl sm:text-3xl font-extrabold tracking-wide text-gray-800 text-center sm:text-left py-2 sm:py-0 font-sans'>
							RATAN MANAGEMENT SYSTEM
						</h1>

						{/* Navigation Links */}
						<div className='flex flex-wrap gap-2 justify-center sm:justify-end w-full sm:w-auto'>
							<Link
								to='/'
								className='flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-2xl shadow hover:bg-blue-600 transition-all'>
								<Home size={18} />
								Dashboard
							</Link>
							<Link
								to='/user'
								className='flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-2xl shadow hover:bg-emerald-600 transition-all'>
								<Users size={18} />
								Users
							</Link>
							<Link
								to='/renovations'
								className='flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-2xl shadow hover:bg-amber-600 transition-all'>
								<Wrench size={18} />
								Expenses
							</Link>
						</div>
					</div>
				</nav>

				{/* Main Content with padding to account for navbar */}
				<main className='pt-24 p-4'>
					{' '}
					{/* 👈 push content down more */}
					<Routes>
						<Route path='/' element={<Dashboard />} />
						<Route path='/User' element={<User />} />
						<Route path='/renovations' element={<Renovations />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}
