import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Clock, MapPin, MessageSquare, Zap } from 'lucide-react';

// Connect to the backend server
const socket = io(process.env.VITE_API_URL || 'http://localhost:3000');

interface OperationalInsight {
  type: 'CROWD_ALERT' | 'PREDICTION' | 'FEEDBACK';
  location: string | null;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string | null;
  timestamp: string;
  eventId: string;
}

export default function OrganizerCommandCenter() {
  const { eventId } = useParams();
  const [insights, setInsights] = useState<OperationalInsight[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected to Command Center Socket');
      // Join the room specific to this event
      socket.emit('join_event_room', eventId);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('operational_insight', (insight: OperationalInsight) => {
      console.log('🌟 New Insight Received:', insight);
      setInsights(prev => [{ ...insight, timestamp: new Date().toLocaleTimeString() }, ...prev]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('operational_insight');
    };
  }, [eventId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500 text-white animate-pulse';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'CROWD_ALERT': return <AlertTriangle className="w-5 h-5" />;
      case 'PREDICTION': return <Zap className="w-5 h-5" />;
      case 'FEEDBACK': return <MessageSquare className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizer Command Center</h1>
          <p className="text-muted-foreground">Real-time AI operational intelligence for Event ID: {eventId}</p>
        </div>
        <Badge variant={connected ? "success" : "destructive"} className={connected ? "bg-green-500" : "bg-red-500"}>
          {connected ? "● Live" : "○ Disconnected"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Alert Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand" /> Live Intelligence Feed
          </h2>

          {insights.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl text-muted-foreground">
              <p>Waiting for AI insights from attendees...</p>
              <p className="text-sm">Send an SMS like "The projector in Hall B is broken" to trigger an alert.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <Card key={idx} className="overflow-hidden border-l-4 border-l-brand transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${getSeverityColor(insight.severity)}`}>
                          {getIcon(insight.type)}
                        </div>
                        <span className="font-bold text-sm">{insight.type.replace('_', ' ')}</span>
                        <span className="text-xs text-muted-foreground">• {insight.timestamp}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {insight.severity.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3" /> Location
                        </div>
                        <p className="font-medium">{insight.location || 'General'}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <AlertTriangle className="w-3 h-3" /> Issue
                        </div>
                        <p className="font-medium">{insight.issue}</p>
                      </div>
                    </div>

                    {insight.suggestion && (
                      <div className="mt-4 p-3 bg-brand-soft rounded-lg border border-brand-border">
                        <div className="flex items-center gap-2 text-xs font-bold text-brand mb-1">
                          <CheckCircle2 className="w-3 h-3" /> AI SUGGESTION
                        </div>
                        <p className="text-sm italic text-brand-strong">"{insight.suggestion}"</p>
                      </div>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="h-8 text-xs">Ignore</Button>
                      <Button size="sm" className="h-8 text-xs bg-brand hover:bg-brand-strong">
                        Broadcast Fix
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* System Status / Stats */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">System Health</h2>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Operational Load</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Normal</div>
              <p className="text-xs text-muted-foreground">No critical bottlenecks detected.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.length}</div>
              <p className="text-xs text-muted-foreground">Insights processed today.</p>
            </CardContent>
          </Card>

          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Pro Tip
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The AI analyzes every attendee SMS. If multiple people mention the same location, the severity is automatically upgraded to HIGH.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
