import { DialogueElement } from '@/types/canvas';

export function DialogueBubble({ element }: { element: DialogueElement }) {
  const {
    hasTail,
    tailAngle,
    tailLength,
    backgroundColor,
    borderColor,
    strokeSize,
    content,
    fontSize,
    fontFamily,
    color,
    textAlign,
  } = element;

  const tailX = tailAngle * 100;
  const tailEndX = tailX;
  const tailEndY = 100 + tailLength;

  return (
    <div className="relative w-full h-full">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 150"
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id={`bubble-clip-${element.id}`}>
            <path
              d={`
                M 10 0
                Q 0 0 0 10
                L 0 80
                Q 0 90 10 90
                ${
                  hasTail
                    ? `
                  L ${tailX - 10} 90
                  L ${tailEndX} ${Math.min(tailEndY, 140)}
                  L ${tailX + 10} 90
                `
                    : ''
                }
                L 90 90
                Q 100 90 100 80
                L 100 10
                Q 100 0 90 0
                Z
              `}
            />
          </clipPath>
        </defs>
        <path
          d={`
            M 10 0
            Q 0 0 0 10
            L 0 80
            Q 0 90 10 90
            ${
              hasTail
                ? `
              L ${tailX - 10} 90
              L ${tailEndX} ${Math.min(tailEndY, 140)}
              L ${tailX + 10} 90
            `
                : ''
            }
            L 90 90
            Q 100 90 100 80
            L 100 10
            Q 100 0 90 0
            Z
          `}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={strokeSize}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden"
        style={{
          fontSize,
          fontFamily,
          color,
          textAlign,
          paddingBottom: hasTail ? '30%' : '10%',
        }}
      >
        <span className="uppercase font-bold leading-tight text-center">
          {content}
        </span>
      </div>
    </div>
  );
}
