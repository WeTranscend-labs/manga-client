'use client';

import { Plan } from '@/types/plans';
import { usePlans } from '../../hooks/use-plans';
import { PlanCard } from '../molecules/plan-card';

interface PlansGridProps {
  onSelectPlan: (plan: Plan) => void;
  isProcessingId?: string | null;
}

export function PlansGrid({ onSelectPlan, isProcessingId }: PlansGridProps) {
  const { data: plans, isLoading, isError } = usePlans();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto items-center">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[450px] rounded-2xl border border-zinc-800 bg-zinc-900/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError || !plans || plans.length === 0) {
    return (
      <div className="w-full py-12 text-center border rounded-2xl border-zinc-800 bg-zinc-900/30">
        <p className="text-zinc-400">
          Failed to load available plans. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto items-center">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onSelect={onSelectPlan}
          isLoading={isProcessingId === plan.id}
        />
      ))}
    </div>
  );
}
