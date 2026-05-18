"use client";

import { useEffect, useState, useCallback } from "react";
import { FaArrowLeft, FaArrowRight, FaCircleHalfStroke, FaGithub, FaCircleCheck } from "react-icons/fa6";

type Side = "left" | "middle" | "right";

interface Counts {
  left: number;
  middle: number;
  right: number;
}

function pct(value: number, total: number) {
  if (total === 0) return 33.33;
  return (value / total) * 100;
}

function TugBar({ counts }: { counts: Counts }) {
  const total = counts.left + counts.middle + counts.right;
  const leftPct = pct(counts.left, total);
  const midPct = pct(counts.middle, total);
  const rightPct = pct(counts.right, total);

  return (
    <div className="w-full">
      <div className="flex h-14 w-full rounded-full overflow-hidden shadow-inner border border-white/10">
        <div
          className="bg-blue-600 transition-all duration-700 ease-in-out flex items-center justify-center"
          style={{ width: `${leftPct}%` }}
        >
          {leftPct > 8 && (
            <span className="text-white text-sm font-bold tabular-nums">
              {leftPct.toFixed(1)}%
            </span>
          )}
        </div>
        <div
          className="bg-purple-600 transition-all duration-700 ease-in-out flex items-center justify-center"
          style={{ width: `${midPct}%` }}
        >
          {midPct > 8 && (
            <span className="text-white text-sm font-bold tabular-nums">
              {midPct.toFixed(1)}%
            </span>
          )}
        </div>
        <div
          className="bg-red-600 transition-all duration-700 ease-in-out flex items-center justify-center"
          style={{ width: `${rightPct}%` }}
        >
          {rightPct > 8 && (
            <span className="text-white text-sm font-bold tabular-nums">
              {rightPct.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-2 text-xs text-zinc-500 px-1">
        <span>{counts.left.toLocaleString()} votes</span>
        <span>{counts.middle.toLocaleString()} votes</span>
        <span>{counts.right.toLocaleString()} votes</span>
      </div>
    </div>
  );
}

function VoteButton({
  side,
  label,
  color,
  voted,
  myVote,
  onClick,
  disabled,
}: {
  side: Side;
  label: string;
  color: string;
  voted: boolean;
  myVote: Side | null;
  onClick: () => void;
  disabled: boolean;
}) {
  const isMyVote = myVote === side;
  const isOther = voted && !isMyVote;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "relative flex flex-col items-center gap-2 flex-1 py-5 rounded-2xl font-bold text-lg transition-all duration-200 border-2 cursor-pointer",
        "focus:outline-none focus-visible:ring-4",
        isMyVote
          ? `${color} border-transparent text-white scale-105 shadow-xl`
          : isOther
          ? "bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed opacity-50"
          : `bg-zinc-900 border-zinc-700 text-zinc-200 hover:scale-105 hover:border-zinc-500`,
      ].join(" ")}
    >
      {isMyVote && (
        <FaCircleCheck className="absolute -top-2 -right-2 text-white text-xl drop-shadow" />
      )}
      <span className="text-2xl">
        {side === "left" ? <FaArrowLeft /> : side === "right" ? <FaArrowRight /> : <FaCircleHalfStroke />}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

export default function Home() {
  const [counts, setCounts] = useState<Counts>({ left: 0, middle: 0, right: 0 });
  const [myVote, setMyVote] = useState<Side | null>(null);
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/votes");
      if (res.ok) setCounts(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("du_vote") as Side | null;
    if (stored) setMyVote(stored);
    fetchCounts().then(() => setLoaded(true));
    const interval = setInterval(fetchCounts, 10_000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  async function castVote(side: Side) {
    if (myVote || voting) return;
    setVoting(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setMyVote(data.votedFor ?? side);
        localStorage.setItem("du_vote", data.votedFor ?? side);
        setCounts(data.counts);
        setMessage("You already voted from this network.");
      } else if (res.ok) {
        setMyVote(side);
        localStorage.setItem("du_vote", side);
        setCounts(data.counts);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } catch {
      setMessage("Could not connect. Please try again.");
    } finally {
      setVoting(false);
    }
  }

  const total = counts.left + counts.middle + counts.right;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl flex flex-col gap-10">
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight mb-3">
            Division <span className="text-purple-400">United</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-lg mx-auto">
            One world. Many voices. One sentiment.
          </p>
        </div>

        {!loaded && (
          <div className="flex flex-col items-center gap-3 py-10 text-zinc-600">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-purple-500 rounded-full animate-spin" />
            <span className="text-sm">Loading votes...</span>
          </div>
        )}

        {loaded && (
          <>
            <div>
              <div className="flex justify-between text-sm font-semibold mb-3 px-1">
                <span className="text-blue-400">← LIBERAL</span>
                <span className="text-zinc-400 text-xs mt-0.5">
                  {total.toLocaleString()} total votes
                </span>
                <span className="text-red-400">CONSERVATIVE →</span>
              </div>
              <TugBar counts={counts} />
            </div>

            <div className="flex gap-4 justify-center">
              <VoteButton
                side="left"
                label="Liberal"
                color="bg-blue-600 hover:bg-blue-500"
                voted={!!myVote}
                myVote={myVote}
                onClick={() => castVote("left")}
                disabled={voting || !!myVote}
              />
              <VoteButton
                side="middle"
                label="Center"
                color="bg-purple-600 hover:bg-purple-500"
                voted={!!myVote}
                myVote={myVote}
                onClick={() => castVote("middle")}
                disabled={voting || !!myVote}
              />
              <VoteButton
                side="right"
                label="Conservative"
                color="bg-red-600 hover:bg-red-500"
                voted={!!myVote}
                myVote={myVote}
                onClick={() => castVote("right")}
                disabled={voting || !!myVote}
              />
            </div>

            {myVote && !message && (
              <p className="text-center text-zinc-400 text-sm">
                You voted{" "}
                <span className="font-bold text-white">
                  {myVote === "left" ? "Liberal" : myVote === "right" ? "Conservative" : "Center"}
                </span>
                . Results update every 10 seconds.
              </p>
            )}
            {message && (
              <p className="text-center text-zinc-400 text-sm">{message}</p>
            )}
          </>
        )}

        <div className="border-t border-zinc-800 pt-8 flex flex-col gap-4 text-center">
          <p className="text-zinc-200 text-base font-medium leading-relaxed max-w-lg mx-auto">
            Why does this exist?
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-lg mx-auto">
            Honestly, we got tired of feeling like everyone hates each other. It doesn&apos;t feel true. Most people just want to live their lives, take care of the people they love, and not fight with strangers online. The ones screaming are the loudest, not the most.
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-lg mx-auto">
            So we built something simple. A place where you can say where you stand and see that you&apos;re not alone, whatever that looks like for you.
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-lg mx-auto">
            No winners. No debate. Just people, showing up. Maybe share it with someone you disagree with. We think the number might surprise you.
          </p>
        </div>

        <footer className="flex flex-col items-center gap-2 text-zinc-700 text-xs">
          <a
            href="https://github.com/michael-ortiz/DivisionUnited"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors"
          >
            <FaGithub className="text-base" />
            Open source on GitHub
          </a>
          <span>Votes are anonymous. One per network connection.</span>
        </footer>
      </div>
    </div>
  );
}
