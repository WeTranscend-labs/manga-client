import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Plan } from '@/types/plans';
import { cn } from '@/utils/utils';

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  isLoading?: boolean;
}

export function PlanCard({ plan, onSelect, isLoading }: PlanCardProps) {
  const isUltra =
    plan.id === 'ultra' || plan.name.toLowerCase().includes('ultra');

  return (
    <div
      className={cn(
        'relative flex flex-col p-6 rounded-2xl border bg-zinc-900/50 backdrop-blur-sm transition-all duration-300',
        isUltra
          ? 'border-amber-500 shadow-lg shadow-amber-500/10 scale-105 z-10'
          : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50',
      )}
    >
      {isUltra && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-full uppercase tracking-wider">
          Most Popular
        </div>
      )}

      <div className="space-y-4 flex-1">
        <div>
          <h3 className="text-xl font-bold text-zinc-100">{plan.name}</h3>
          <p className="text-sm text-zinc-400 mt-1 h-10">{plan.description}</p>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-white">${plan.price}</span>
          <span className="text-zinc-400">/ month</span>
        </div>

        <ul className="space-y-3 pt-4 border-t border-zinc-800/50">
          {plan.features?.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <Icons.Check
                size={18}
                className={
                  isUltra ? 'text-amber-500 shrink-0' : 'text-zinc-500 shrink-0'
                }
              />
              <span className="text-sm text-zinc-300">{feature}</span>
            </li>
          ))}
          <li className="flex items-start gap-3">
            <Icons.Check
              size={18}
              className={
                isUltra ? 'text-amber-500 shrink-0' : 'text-zinc-500 shrink-0'
              }
            />
            <span className="text-sm text-zinc-300 font-bold">
              {plan.monthlyGenerationLimit === -1
                ? 'Unlimited Generations'
                : `${plan.monthlyGenerationLimit} Generations / month`}
            </span>
          </li>
        </ul>
      </div>

      <Button
        className={cn(
          'w-full mt-8 font-semibold h-12 text-base transition-all',
          isUltra
            ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20'
            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100',
        )}
        disabled={isLoading}
        onClick={() => onSelect(plan)}
      >
        {isLoading ? (
          <Icons.Loader2 className="w-5 h-5 animate-spin" />
        ) : plan.price === 0 ? (
          'Current Plan'
        ) : isUltra ? (
          'Upgrade to Ultra'
        ) : (
          'Upgrade to Pro'
        )}
      </Button>
    </div>
  );
}
