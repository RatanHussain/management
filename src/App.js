/** @format */

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import Renovations from './pages/Renovations';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

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
				<nav className='bg-white shadow p-4 flex justify-between'>
					<h1 className='text-xl font-bold'>Room Rent Manager</h1>
					<div className='space-x-4'>
						<Link to='/' className='text-blue-600 hover:underline'>
							Dashboard
						</Link>
						<Link to='/owners' className='text-blue-600 hover:underline'>
							Room Owners
						</Link>
						<Link to='/renovations' className='text-blue-600 hover:underline'>
							Renovation Costs
						</Link>
					</div>
				</nav>

				<main className='p-4'>
					<Routes>
						<Route path='/' element={<Dashboard />} />
						<Route path='/owners' element={<Owners />} />
            <Route path='/renovations' element={<Renovations />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}
