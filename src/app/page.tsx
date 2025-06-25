'use client';

import Link from 'next/link';
import Image from 'next/image';
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
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-20 text-center md:py-32 md:text-left">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-center md:items-start gap-6">
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl font-headline">
                Stop juggling tasks. Start adapting.
              </h2>
              <p className="max-w-xl text-lg text-muted-foreground">
                AdaptiPlan is your intelligent partner for a productive day. It breaks down overwhelming tasks, adapts to your mood, and helps you build better habits, one step at a time.
              </p>
              <Button size="lg" asChild>
                <Link href="/app">
                  Start Planning for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative w-full max-w-md mx-auto md:max-w-none">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl -z-10"></div>
                <Image
                    src="https://placehold.co/1200x800.png"
                    alt="AdaptiPlan app screenshot"
                    width={1200}
                    height={800}
                    className="rounded-xl shadow-2xl ring-1 ring-white/10"
                    data-ai-hint="app screenshot"
                />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
                <h3 className="text-3xl font-bold font-headline">A Planner That Truly Understands You</h3>
                <p className="mt-4 text-lg text-muted-foreground">
                    AdaptiPlan isn't just a to-do list. It's an AI partner that helps you navigate your day with less stress and more focus.
                </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="hover:shadow-lg hover:border-primary/50 transition-all">
                <CardHeader className="items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Wand2 className="h-7 w-7" />
                  </div>
                  <CardTitle className="font-headline text-xl">Smart Task Decomposition</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Feeling overwhelmed? Enter a big task, and our AI will break it down into small, manageable steps.
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg hover:border-primary/50 transition-all">
                <CardHeader className="items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CalendarClock className="h-7 w-7" />
                  </div>
                   <CardTitle className="font-headline text-xl">Adaptive Scheduling</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Life happens. If you miss a task, our AI non-judgmentally helps you reschedule and adjust your day.
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg hover:border-primary/50 transition-all">
                <CardHeader className="items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Lightbulb className="h-7 w-7" />
                    </div>
                  <CardTitle className="font-headline text-xl">Mindful Moments</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  Feeling stressed? AdaptiPlan offers short, actionable mindfulness suggestions to help you reset.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section className="py-20 sm:py-24">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-2xl text-center">
                    <h3 className="text-3xl font-bold font-headline">Get Started in 3 Simple Steps</h3>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Transform your productivity in minutes.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xl font-headline">1</div>
                        <h4 className="text-xl font-semibold font-headline">Enter a Task</h4>
                        <p className="text-muted-foreground">Start by telling AdaptiPlan about a big task you need to accomplish.</p>
                    </div>
                     <div className="flex flex-col items-center text-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xl font-headline">2</div>
                        <h4 className="text-xl font-semibold font-headline">Watch the Magic</h4>
                        <p className="text-muted-foreground">Our AI instantly breaks it down into a clear, actionable timeline of smaller steps.</p>
                    </div>
                     <div className="flex flex-col items-center text-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xl font-headline">3</div>
                        <h4 className="text-xl font-semibold font-headline">Adapt and Conquer</h4>
                        <p className="text-muted-foreground">Follow your plan, and if things change, AdaptiPlan helps you adjust on the fly.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 sm:py-24 bg-secondary">
            <div className="container mx-auto px-4 text-center">
                 <h3 className="text-3xl font-bold font-headline">Ready to Reclaim Your Focus?</h3>
                 <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Stop letting your to-do list run your life. Start planning with an AI that adapts to you.
                 </p>
                 <div className="mt-8">
                     <Button size="lg" asChild>
                        <Link href="/app">
                            Get Started for Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                 </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-center md:text-left">
                <AdaptiPlanLogo className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} AdaptiPlan. All rights reserved.</p>
            </div>
            <p className="text-sm text-muted-foreground">
                Powered by Firebase Studio
            </p>
        </div>
      </footer>
    </div>
  );
}
