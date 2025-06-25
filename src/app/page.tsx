'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdaptiPlanLogo } from '@/components/icons';
import { ArrowRight, Wand2, CalendarClock, Lightbulb } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AdaptiPlanLogo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline">AdaptiPlan</h1>
          </Link>
          <Button asChild>
            <Link href="/app">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center sm:py-32">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-headline">
            The smarter way to plan your day.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            AdaptiPlan is an intelligent planner that breaks down your overwhelming tasks, adapts to your mood, and helps you build better habits, one step at a time.
          </p>
          <div className="mt-10">
            <Button size="lg" asChild>
              <Link href="/app">
                Start Planning for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
                <h3 className="text-3xl font-bold font-headline">A Planner That Understands You</h3>
                <p className="mt-4 text-muted-foreground">
                    AdaptiPlan isn't just a to-do list. It's an AI partner that helps you navigate your day with less stress and more focus.
                </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card>
                <CardHeader className="items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Wand2 className="h-6 w-6" />
                  </div>
                  <CardTitle>Smart Task Decomposition</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Feeling overwhelmed? Just enter a big task, and our AI will break it down into small, manageable steps for you.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CalendarClock className="h-6 w-6" />
                  </div>
                   <CardTitle>Adaptive Scheduling</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Life happens. If you miss a task, our AI will non-judgmentally help you reschedule and adjust your day.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Lightbulb className="h-6 w-6" />
                    </div>
                  <CardTitle>Mindful Moments</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Feeling stressed? AdaptiPlan can offer you short, actionable mindfulness suggestions to help you reset.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 text-xs text-muted-foreground">
        <p>AdaptiPlan by Firebase Studio</p>
      </footer>
    </div>
  );
}
