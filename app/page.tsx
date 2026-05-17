"use client";

import { useEffect, useState, useCallback } from "react";
import { FaArrowLeft, FaArrowRight, FaCircleHalfStroke } from "react-icons/fa6";

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
        "relative flex flex-col items-center gap-2 px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-200 border-2 cursor-pointer",
        "focus:outline-none focus-visible:ring-4",
        isMyVote
          ? `${color} border-transparent text-white scale-105 shadow-xl`
          : isOther
          ? "bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed opacity-50"
          : `bg-zinc-900 border-zinc-700 text-zinc-200 hover:scale-105 hover:border-zinc-500`,
      ].join(" ")}
    >
      {isMyVote && (
        <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-black rounded-full w-6 h-6 flex items-center justify-center shadow">
          ✓
        </span>
      )}
      <span className="text-2xl">
        {side === "left" ? <FaArrowLeft /> : side === "right" ? <FaArrowRight /> : <FaCircleHalfStroke />}
      </span>
      <span>{label}</span>
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
            One world. Many voices. One conversation.
          </p>
        </div>

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

            <div className="flex gap-4 justify-center flex-wrap">
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
            We built this because we&apos;re tired of being told we&apos;re enemies.
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-lg mx-auto">
            The headlines that outrage, the algorithms that divide. They don&apos;t speak for most of us. Most people are reasonable, nuanced, and somewhere in between. They&apos;re just quieter than the noise.
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-lg mx-auto">
            Division United is a living pulse check for the world. No agenda, no winner, no sides to defeat. Just an honest look at where humanity stands, updated in real time by real people.
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-lg mx-auto">
            Cast your vote. Reflect on what you see. Share it with someone who thinks differently. Come back and watch it shift. The world our kids inherit depends on whether we choose to see each other first.
          </p>
        </div>

        <footer className="text-center text-zinc-700 text-xs">
          Votes are anonymous. One per network connection.
        </footer>
      </div>
    </div>
  );
}
