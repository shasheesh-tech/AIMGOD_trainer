import React from 'react';
import { History, Calendar, Play, Crosshair } from 'lucide-react';
import { SessionResult } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface HistoryScreenProps {
  history: SessionResult[];
  onStartNewSession: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  onStartNewSession,
}) => {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-dark-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">ARCHIVE</Badge>
            <span className="text-xs font-mono text-slate-400">PRACTICE RECORD LOG</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-100 uppercase tracking-wide mt-1">
            Session History
          </h1>
          <p className="text-xs text-slate-400">
            Real performance records from your completed 3D target training drills.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Play className="w-4 h-4 fill-current" />}
          onClick={onStartNewSession}
        >
          New Training Run
        </Button>
      </div>

      {/* History Table or Empty State */}
      {history.length === 0 ? (
        <Card className="text-center py-16 px-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-dark-950 border border-dark-750 flex items-center justify-center mx-auto text-slate-600">
              <Crosshair className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-display font-bold uppercase text-slate-200">
                No Practice Records Yet
              </h3>
              <p className="text-xs text-slate-400">
                Complete a session in the 3D training arena to start logging your accuracy, reaction times, and scores.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              icon={<Play className="w-4 h-4 fill-current" />}
              onClick={onStartNewSession}
            >
              Start First Session
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          title="Recorded Practice Sessions"
          subtitle={`${history.length} completed session${history.length === 1 ? '' : 's'}`}
          icon={<History className="w-4 h-4" />}
        >
          <div className="overflow-x-auto -mx-5 -my-2">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-dark-950/80 text-slate-400 uppercase tracking-wider border-b border-dark-800">
                <tr>
                  <th className="py-3 px-5">Date & Time</th>
                  <th className="py-3 px-5">Mode & Duration</th>
                  <th className="py-3 px-5 text-right">Score</th>
                  <th className="py-3 px-5 text-right">Accuracy</th>
                  <th className="py-3 px-5 text-center">Hits / Miss</th>
                  <th className="py-3 px-5 text-right">Avg Reaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/60 text-slate-200">
                {history.map((item) => {
                  const dateStr = new Date(item.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr key={item.id} className="hover:bg-dark-800/40 transition-colors">
                      <td className="py-3.5 px-5 flex items-center gap-2 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
                        <span>{dateStr}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-display font-semibold uppercase text-slate-200">
                          {item.config.mode.replace('_', ' ')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.config.duration}s &bull; {item.config.targetShape} ({item.config.targetSize})
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right font-bold text-slate-100 text-sm">
                        {item.score.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span
                          className={`font-bold ${
                            item.accuracy >= 90
                              ? 'text-brand-emerald'
                              : item.accuracy >= 75
                              ? 'text-brand-amber'
                              : 'text-brand-rose'
                          }`}
                        >
                          {item.accuracy}%
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="text-brand-emerald">{item.hits}</span> /{' '}
                        <span className="text-brand-rose">{item.misses}</span>
                      </td>
                      <td className="py-3.5 px-5 text-right text-brand-cyan font-bold">
                        {item.avgReactionTimeMs > 0 ? `${item.avgReactionTimeMs}ms` : '---'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
