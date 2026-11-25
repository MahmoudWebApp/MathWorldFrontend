'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { BookOpen, CheckCircle2, Loader2 } from 'lucide-react';
import { DirectionalArrow } from '@/components/ui/DirectionalNavigation';

import { useGetStagesQuery,useGetPublishedTracksQuery,useGetTrackSelectionQuery,useSelectTrackMutation } from '@/store/api/stagesApi';
import {
  useGetLearningStageQuery,
  useGetStudentOnboardingQuery,
  useSetLearningStageMutation,
} from '@/store/api/usersApi';
import { getApiErrorMessage } from '@/lib/authSession';

const labels = {
  ar: {
    eyebrow: 'بداية رحلتك',
    title: 'اختر مرحلتك التعليمية',
    description:
      'سنرتب المسائل والتقدم وفق مرحلتك. يمكنك تغيير الاختيار لاحقًا دون فقدان محاولاتك أو نقاطك.',
    selected: 'المرحلة المختارة',
    save: 'حفظ المرحلة وعرض فئاتي المفتوحة',
    change: 'حفظ التغيير وعرض فئاتي',
    loading: 'جاري تحميل المراحل التعليمية...',
    error: 'تعذر تحميل المراحل التعليمية. حاول تحديث الصفحة.',
    submitError: 'تعذر حفظ المرحلة. حاول مجددًا.',
    choose: 'اختر إحدى المراحل التعليمية للمتابعة',
  },
  en: {
    eyebrow: 'Your learning journey',
    title: 'Choose your learning stage',
    description:
      'We will personalize your problems and progress to this stage. You can change it later without losing attempts or points.',
    selected: 'Selected stage',
    save: 'Save stage and see unlocked topics',
    change: 'Save changes and see my topics',
    loading: 'Loading stages...',
    error: 'Unable to load stages. Please refresh the page.',
    submitError: 'Could not save your stage. Please try again.',
    choose: 'Select a stage to continue',
  },
};

export default function LearningStagePage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const copy = isArabic ? labels.ar : labels.en;
  const { data: stages, isLoading: loadingStages, isError: stageError } =
    useGetStagesQuery(locale);
  const {
    data: activeStage,
    isLoading: loadingChoice,
    isError: choiceError,
  } = useGetLearningStageQuery();
  const onboarding=useGetStudentOnboardingQuery(undefined);
  const mandatoryTrack=onboarding.data?.TrackRequired===true;
  const [setLearningStage, { isLoading: saving }] =
    useSetLearningStageMutation();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [trackChoice,setTrackChoice]=useState<number|null>(null);
  const [selectTrack,{isLoading:savingTrack}]=useSelectTrackMutation();

  const effectiveId = selectedId ?? activeStage?.StageId ?? null;
  const catalog=useGetPublishedTracksQuery(effectiveId??0,{skip:effectiveId==null,refetchOnMountOrArgChange:true});
  const previous=useGetTrackSelectionQuery(undefined,{refetchOnMountOrArgChange:true});
  const options=catalog.currentData?.Items??[];
  const requiresTrack=mandatoryTrack||(catalog.currentData?.Enabled===true&&options.length>0);
  const effectiveTrack=options.find(x=>x.Id===(trackChoice??previous.data?.TrackId))?.Id??null;
  const checkingTracks=effectiveId!=null&&(catalog.isLoading||catalog.isFetching);
  // A 404 from the old API is the only permitted compatibility fallback.
  const catalogUnavailable=catalog.isError&&(mandatoryTrack||(catalog.error as {status?:number})?.status!==404);

  const save = async () => {
    if (effectiveId == null || saving || savingTrack || checkingTracks || catalogUnavailable || (requiresTrack&&effectiveTrack==null)) {
      return;
    }
    setError('');
    try {
      if(requiresTrack&&effectiveTrack!=null) await selectTrack({TrackId:effectiveTrack}).unwrap();
      else await setLearningStage({ StageId: effectiveId }).unwrap();
      // Keep the learner in the private workspace after onboarding or switching stages.
      window.location.assign(`/${locale}/dashboard/categories`);
    } catch (reason) {
      setError(getApiErrorMessage(reason, copy.submitError));
    }
  };

  return (
    <main className="container mx-auto min-h-[75vh] max-w-5xl px-4 py-10 md:py-16">
      <div className="brand-surface math-card rounded-3xl p-6 md:p-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <BookOpen size={16} />
            {copy.eyebrow}
          </span>
          <h1 className="brand-display-title text-gradient-math mb-3 text-3xl font-bold md:text-4xl">
            {copy.title}
          </h1>
          <p className="text-muted-foreground">{copy.description}</p>
        </div>

        {loadingStages || loadingChoice ? (
          <div className="mt-10 flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            {copy.loading}
          </div>
        ) : stageError || choiceError ? (
          <p role="alert" className="mt-10 text-center text-destructive">
            {copy.error}
          </p>
        ) : (
          <>
            <fieldset className="mt-10 grid gap-4 md:grid-cols-2">
              <legend className="sr-only">{copy.title}</legend>
              {(stages ?? []).map((stage) => {
                const selected = stage.Id === effectiveId;
                return (
                  <button
                    key={stage.Id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {setSelectedId(stage.Id);setTrackChoice(null);}}
                    className={[
                      'flex min-h-28 items-center justify-between gap-4 rounded-2xl border p-5 text-start transition-all',
                      selected
                        ? 'border-primary bg-primary/10 shadow-[0_12px_30px_rgba(92,36,255,0.10)]'
                        : 'border-border bg-card hover:border-primary/50',
                    ].join(' ')}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <BookOpen size={22} />
                      </span>
                      <span className="text-lg font-semibold">
                        {isArabic ? stage.NameAr : stage.NameEn}
                      </span>
                    </div>
                    {selected && (
                      <CheckCircle2
                        aria-label={copy.selected}
                        size={22}
                        className="shrink-0 text-primary"
                      />
                    )}
                  </button>
                );
              })}
            </fieldset>

            {checkingTracks&&<p className="mt-4 text-sm text-muted-foreground" role="status">{isArabic?'جارٍ تحميل الصفوف والمساقات…':'Loading grades and courses…'}</p>}
            {catalogUnavailable&&<p role="alert" className="mt-4 text-sm text-destructive">{isArabic?'تعذّر تحميل المسارات.':'Could not load learning tracks.'} <button className="underline" onClick={()=>void catalog.refetch()}>{isArabic?'إعادة المحاولة':'Retry'}</button></p>}
            {mandatoryTrack&&effectiveId!=null&&!checkingTracks&&!catalogUnavailable&&options.length===0&&<p role="alert" className="mt-4 text-sm text-destructive">{isArabic?'لا تتوفر صفوف أو مساقات منشورة لهذه المرحلة حالياً.':'No published grades or courses are available for this stage yet.'}</p>}
            {requiresTrack&&options.length>0&&<fieldset className="mt-6 space-y-2"><legend className="font-bold">{isArabic?'اختر الصف أو المساق':'Choose grade or course'}</legend>
              <div className="grid gap-2 sm:grid-cols-2">{options.map(track=><button type="button" key={track.Id} aria-pressed={effectiveTrack===track.Id} onClick={()=>setTrackChoice(track.Id)} className={'rounded-xl border p-3 text-start '+(effectiveTrack===track.Id?'border-primary bg-primary/10':'bg-card')}><span className="font-semibold">{isArabic?track.NameAr:track.NameEn}</span><span className="ms-2 text-xs text-muted-foreground">{track.ProblemsCount} {isArabic?'مسألة':'problems'}</span>{track.FreeProblemsCount===0&&<span className="block mt-1 text-xs text-muted-foreground">{isArabic?'التدريب لمشتركي Premium':'Premium practice only'}</span>}</button>)}</div>
            </fieldset>}
            {error && (
              <p role="alert" className="mt-6 text-center text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={save}
                disabled={effectiveId == null || saving || savingTrack || checkingTracks || catalogUnavailable || (requiresTrack&&effectiveTrack==null)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving || savingTrack ? <Loader2 size={19} className="animate-spin" /> : <DirectionalArrow direction="forward" size={19} />}
                {activeStage?.HasSelectedStage ? copy.change : copy.save}
              </button>
              {effectiveId == null && (
                <p className="text-sm text-muted-foreground">{copy.choose}</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
