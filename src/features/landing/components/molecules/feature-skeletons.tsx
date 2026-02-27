import { Play } from 'lucide-react';
import Image from 'next/image';

export const SkeletonOne = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-200">
      <a
        href="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full p-5 mx-auto bg-zinc-900/50 shadow-lg group h-full rounded-lg border border-zinc-800 hover:border-amber-500 transition-all cursor-pointer"
      >
        <div className="flex flex-1 w-full h-full flex-col space-y-4 relative">
          <Image
            src="/demo-img/demoimg1.png"
            alt="Manga generation demo"
            fill
            className="object-cover rounded-lg group-hover:opacity-75 transition-opacity"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform relative z-10">
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </div>
          </div>
        </div>
      </a>

      <div
        className="absolute inset-0 w-full pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to top, var(--color-zinc-950), transparent)',
        }}
      />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-black via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};

export const SkeletonTwo = () => {
  return (
    <div className="relative flex flex-col items-center justify-center p-8 gap-8 h-full overflow-hidden">
      <div className="relative w-full h-[45%]">
        <div className="absolute left-[5%] top-0 w-[45%] h-full transform -rotate-6 transition-transform hover:rotate-0 hover:scale-105 duration-300">
          <Image
            src="/demo-img/demoimg1.png"
            alt="Character example 1"
            fill
            className="object-cover rounded-xl shadow-2xl border-4 border-white/10"
            sizes="25vw"
          />
        </div>
        <div className="absolute right-[5%] top-0 w-[45%] h-full transform rotate-6 transition-transform hover:rotate-0 hover:scale-105 duration-300 z-10">
          <Image
            src="/demo-img/demoimg2.png"
            alt="Character example 2"
            fill
            className="object-cover rounded-xl shadow-2xl border-4 border-white/10"
            sizes="25vw"
          />
        </div>
      </div>

      <div className="relative w-full h-[45%]">
        <div className="absolute left-[5%] bottom-0 w-[45%] h-full transform rotate-3 transition-transform hover:rotate-0 hover:scale-105 duration-300">
          <Image
            src="/demo-img/demoimg3.png"
            alt="Character example 3"
            fill
            className="object-cover rounded-xl shadow-2xl border-4 border-white/10"
            sizes="25vw"
          />
        </div>
        <div className="absolute right-[5%] bottom-0 w-[45%] h-full transform -rotate-3 transition-transform hover:rotate-0 hover:scale-105 duration-300 z-10">
          <Image
            src="/demo-img/demoimg4.png"
            alt="Character example 4"
            fill
            className="object-cover rounded-xl shadow-2xl border-4 border-white/10"
            sizes="25vw"
          />
        </div>
      </div>

      <div className="absolute left-0 z-[100] inset-y-0 w-20 bg-gradient-to-r from-black to-transparent h-full pointer-events-none" />
      <div className="absolute right-0 z-[100] inset-y-0 w-20 bg-gradient-to-l from-black to-transparent h-full pointer-events-none" />
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <div className="relative flex gap-3 h-full group/styles p-4">
      <div className="grid grid-cols-3 gap-3 w-full h-full">
        <div className="relative w-full h-full">
          <Image
            src="/demo-img/demoimg1.png"
            alt="Shonen style"
            fill
            className="object-cover rounded-lg border border-zinc-800 hover:border-amber-500 transition-all"
            sizes="33vw"
          />
        </div>
        <div className="relative w-full h-full">
          <Image
            src="/demo-img/demoimg2.png"
            alt="Seinen style"
            fill
            className="object-cover rounded-lg border border-zinc-800 hover:border-amber-500 transition-all"
            sizes="33vw"
          />
        </div>
        <div className="relative w-full h-full">
          <Image
            src="/demo-img/demoimg3.png"
            alt="Shoujo style"
            fill
            className="object-cover rounded-lg border border-zinc-800 hover:border-amber-500 transition-all"
            sizes="33vw"
          />
        </div>
        <div className="relative w-full h-full col-start-1">
          <Image
            src="/demo-img/demoimg4.png"
            alt="Kodomo style"
            fill
            className="object-cover rounded-lg border border-zinc-800 hover:border-amber-500 transition-all"
            sizes="33vw"
          />
        </div>
        <div className="relative w-full h-full">
          <Image
            src="/demo-img/demoimg5.png"
            alt="Josei style"
            fill
            className="object-cover rounded-lg border border-zinc-800 hover:border-amber-500 transition-all"
            sizes="33vw"
          />
        </div>
      </div>
    </div>
  );
};

export const SkeletonFour = () => {
  return (
    <div className="h-60 md:h-60 flex flex-col items-center justify-center relative bg-transparent mt-10 p-8">
      <div className="relative w-full h-full">
        <div className="grid grid-cols-2 gap-3 h-full">
          <div className="relative w-full h-full">
            <Image
              src="/demo-img/demoimg5.png"
              alt="Session pages"
              fill
              className="object-cover rounded-lg border border-zinc-800"
              sizes="50vw"
            />
          </div>
          <div className="relative w-full h-full">
            <Image
              src="/demo-img/demoimg6.png"
              alt="PDF export"
              fill
              className="object-cover rounded-lg border border-zinc-800"
              sizes="50vw"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
