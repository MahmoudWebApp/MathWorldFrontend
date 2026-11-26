'use client';
import {useSelector} from 'react-redux';
import type {RootState} from '@/store';
import {EditorialWorkspace} from '@/components/editorial/EditorialWorkspace';
export default function SupervisorReviewsPage(){
 const admin=useSelector((s:RootState)=>s.auth.user?.Role==='Admin'&&s.auth.isAuthenticated);
 if(!admin)return null;
 return <main className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6"><EditorialWorkspace admin canSubmit initialTab="requests"/></main>;
}
