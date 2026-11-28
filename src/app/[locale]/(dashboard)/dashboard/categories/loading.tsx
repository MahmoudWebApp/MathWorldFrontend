'use client';
import {useLocale} from 'next-intl';
import {StudentCategoryLoading} from '@/components/dashboard/StudentCategoryLoading';
export default function Loading(){return <StudentCategoryLoading ar={useLocale()==='ar'}/>;}
