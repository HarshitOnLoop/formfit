import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
// @ts-ignore
import ConfettiCannon from 'react-native-confetti-cannon';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line } from 'react-native-svg';
import {
  useFonts,
  NotoSans_400Regular,
  NotoSans_600SemiBold,
  NotoSans_700Bold,
  NotoSans_800ExtraBold,
  NotoSans_900Black,
} from '@expo-google-fonts/noto-sans';

const calendarYear = 2026;
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const workoutSections = [
  { name: 'Triceps', category: 'Upper Body', description: 'Extensions and pressdowns', exercises: 8, minutes: 30, sets: 16, color: '#007aff', icon: 'barbell-outline' },
  { name: 'Back', category: 'Posterior Chain', description: 'Lats, rhomboids and erectors', exercises: 10, minutes: 45, sets: 24, color: '#34c759', icon: 'sync-outline' },
  { name: 'Chest', category: 'Upper Body', description: 'Presses and powerful flyes', exercises: 9, minutes: 40, sets: 22, color: '#e0564c', icon: 'flame-outline' },
  { name: 'Legs', category: 'Lower Body', description: 'Quads, hamstrings and glutes', exercises: 12, minutes: 60, sets: 36, color: '#ff9500', icon: 'flash-outline' },
  { name: 'Shoulder', category: 'Deltoids', description: 'Anterior, lateral and rear head', exercises: 7, minutes: 35, sets: 20, color: '#00a2ff', icon: 'navigate-outline' },
  { name: 'Biceps', category: 'Upper Body', description: 'Peak contraction and control', exercises: 6, minutes: 25, sets: 14, color: '#8b5cf6', icon: 'fitness-outline' },
  { name: 'Abs', category: 'Midline Core', description: 'Stability, obliques and flexion', exercises: 8, minutes: 30, sets: 18, color: '#6835f1', icon: 'time-outline' },
] as const;

export type WorkoutSection = (typeof workoutSections)[number];

export interface ExerciseItem {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  equipment: string;
  cue: string;
  tutorial: string[];
}

const workoutExercises: Record<string, ExerciseItem[]> = {
  Triceps: [
    { id: 'tri-1', name: 'Rope Cable Pushdown', sets: '4 Sets', reps: '12-15 Reps', rest: '60s Rest', equipment: 'Cable Rope', cue: 'Flared elbows locked, spread rope at the bottom for peak lateral head squeeze.', tutorial: ['Attach a rope handle to the high cable pulley.', 'Stand facing the machine, grip both ends of the rope with a neutral grip.', 'Keep your elbows pinned to your sides throughout the movement.', 'Push the rope downward by extending your elbows fully.', 'At the bottom, spread the rope apart to squeeze the lateral tricep head.', 'Slowly return to the starting position with a controlled 2-second negative.'] },
    { id: 'tri-2', name: 'Skull Crushers (EZ Bar)', sets: '4 Sets', reps: '8-10 Reps', rest: '90s Rest', equipment: 'EZ Bar / Bench', cue: 'Keep upper arms perpendicular to floor, lower bar slowly behind forehead.', tutorial: ['Lie flat on a bench holding an EZ bar with a close grip.', 'Extend arms straight above your chest — this is your start position.', 'Keep upper arms stationary and perpendicular to the floor.', 'Slowly bend elbows to lower the bar toward your forehead or just behind it.', 'Pause briefly, then press the bar back up by extending your elbows.', 'Focus on a slow 3-second eccentric to maximize tricep tension.'] },
    { id: 'tri-3', name: 'Overhead DB Extension', sets: '3 Sets', reps: '10-12 Reps', rest: '75s Rest', equipment: 'Dumbbell', cue: 'Full vertical stretch on the long head with elbows pointing forward.', tutorial: ['Sit or stand holding one dumbbell with both hands behind your head.', 'Keep your elbows pointing forward and close to your ears.', 'Lower the dumbbell behind your head until you feel a deep stretch.', 'Press the weight back up by fully extending your arms overhead.', 'Squeeze at the top and control the descent on every rep.'] },
    { id: 'tri-4', name: 'Straight-Bar Cable Pressdown', sets: '3 Sets', reps: '12 Reps', rest: '60s Rest', equipment: 'Cable Bar', cue: 'Drive straight down with explosive contraction, strict 2s negative.', tutorial: ['Attach a straight bar to the high cable pulley.', 'Grip the bar with an overhand grip, hands shoulder-width apart.', 'Keep elbows locked to your sides throughout the movement.', 'Push the bar down explosively until your arms are fully extended.', 'Hold the contraction for 1 second at the bottom.', 'Return to start with a slow 2-second negative.'] },
    { id: 'tri-5', name: 'Close-Grip Bench Press', sets: '3 Sets', reps: '8 Reps', rest: '90s Rest', equipment: 'Barbell', cue: 'Hands shoulder-width apart, tuck elbows close to ribcage.', tutorial: ['Lie on a flat bench and grip the barbell with hands shoulder-width apart.', 'Unrack the bar and hold it above your chest with arms extended.', 'Lower the bar slowly to your lower chest, keeping elbows tucked close to your body.', 'Press the bar back up by extending your arms, focusing on tricep engagement.', 'Lock out at the top and repeat for the prescribed reps.'] },
    { id: 'tri-6', name: 'Weighted / Bench Dips', sets: '3 Sets', reps: '15 Reps', rest: '60s Rest', equipment: 'Parallel Bars', cue: 'Keep torso upright to keep direct mechanical tension on triceps.', tutorial: ['Position yourself on parallel bars or between two benches.', 'Keep your torso upright — do not lean forward.', 'Lower your body by bending your elbows to about 90 degrees.', 'Press back up by extending your arms fully.', 'Add weight with a belt or plate on your lap for added resistance.'] },
    { id: 'tri-7', name: 'Single-Arm Cable Kickback', sets: '3 Sets', reps: '15 Reps', rest: '45s Rest', equipment: 'Cable No-Handle', cue: 'Hold peak contraction at horizontal extension for 1 second.', tutorial: ['Set a cable to the lowest position, no handle attachment.', 'Hinge forward at the hips, grab the cable ball stop with one hand.', 'Keep your upper arm parallel to the floor and elbow at 90 degrees.', 'Extend your arm backward until it is fully straight.', 'Hold peak contraction for 1 second, then slowly return.', 'Complete all reps on one arm before switching.'] },
    { id: 'tri-8', name: 'Diamond Push-Up Finisher', sets: '3 Sets', reps: 'To Failure', rest: '60s Rest', equipment: 'Bodyweight', cue: 'Hands forming a diamond under chest, pump out maximum volume.', tutorial: ['Get into a push-up position on the floor.', 'Place your hands together under your chest forming a diamond shape with thumbs and index fingers.', 'Lower your chest toward your hands, keeping elbows close to your body.', 'Push back up explosively until arms are fully extended.', 'Repeat until complete failure for maximum volume.'] },
  ],
  Back: [
    { id: 'back-1', name: 'Conventional Barbell Deadlift', sets: '4 Sets', reps: '5-6 Reps', rest: '120s Rest', equipment: 'Olympic Barbell', cue: 'Drive hard through heels, engage lats to keep bar tight against shins.', tutorial: ['Stand with feet hip-width apart, barbell over mid-foot.', 'Hinge at hips and grip bar just outside your knees (overhand or mixed grip).', 'Drop your hips, brace your core, and flatten your back.', 'Drive through your heels, keeping the bar tight against your shins.', 'Extend hips and knees simultaneously until standing tall.', 'Reverse the motion under control to return the bar to the floor.'] },
    { id: 'back-2', name: 'Wide-Grip Lat Pulldown', sets: '4 Sets', reps: '10-12 Reps', rest: '75s Rest', equipment: 'Cable Pulldown', cue: 'Pull with elbows down to collarbone, arch upper back slightly.', tutorial: ['Sit at the lat pulldown machine, thighs secured under the pads.', 'Grip the wide bar with hands wider than shoulder-width.', 'Lean back slightly and arch your upper back.', 'Pull the bar down to your upper chest by driving your elbows downward.', 'Squeeze your lats at the bottom of the rep for 1 second.', 'Slowly extend arms back up to a full stretch.'] },
    { id: 'back-3', name: 'Bent-Over Barbell Row', sets: '4 Sets', reps: '8-10 Reps', rest: '90s Rest', equipment: 'Barbell', cue: 'Hinge at 45 degrees, pull bar to belly button and squeeze rhomboids.', tutorial: ['Stand with feet shoulder-width, bend knees slightly and hinge forward at the hips to 45 degrees.', 'Grip the barbell with an overhand grip just wider than shoulder-width.', 'Let the bar hang at arm\'s length below your chest.', 'Pull the bar toward your belly button, squeezing your shoulder blades together.', 'Hold the top position for a beat, then lower under control.'] },
    { id: 'back-4', name: 'Seated Cable Row (Close V-Grip)', sets: '3 Sets', reps: '10-12 Reps', rest: '60s Rest', equipment: 'Cable Row Machine', cue: 'Full forward stretch, pull to lower sternum with chest puffed up.', tutorial: ['Sit at the cable row station with feet on the footplates, knees slightly bent.', 'Grab the V-grip handle and sit upright with arms fully extended.', 'Pull the handle toward your lower sternum while puffing your chest up.', 'Squeeze your back muscles at the contraction for 1 second.', 'Slowly extend arms forward to get a full lat stretch.'] },
    { id: 'back-5', name: 'Single-Arm DB Row', sets: '3 Sets', reps: '10-12 Reps', rest: '60s Rest', equipment: 'Dumbbell / Bench', cue: 'Pull dumbbell toward hip crease to emphasize lower lat fibers.', tutorial: ['Place one knee and hand on a bench for support.', 'Hold a dumbbell in the other hand, arm hanging straight down.', 'Pull the dumbbell toward your hip crease, driving your elbow upward.', 'Squeeze your lat at the top, then lower slowly.', 'Complete all reps on one side before switching.'] },
    { id: 'back-6', name: 'T-Bar Heavy Supported Row', sets: '3 Sets', reps: '8-10 Reps', rest: '90s Rest', equipment: 'T-Bar Station', cue: 'Heavy thickness builder, pause for half a second at contraction.', tutorial: ['Straddle the T-bar, grip the handles with both hands.', 'Bend at the hips, keeping your back flat and core braced.', 'Pull the weight toward your chest by driving your elbows backward.', 'Hold the contraction for half a second.', 'Lower the weight under control and repeat.'] },
    { id: 'back-7', name: 'Straight-Arm Cable Pulldown', sets: '3 Sets', reps: '15 Reps', rest: '45s Rest', equipment: 'Cable Straight Bar', cue: 'Isolate lats without forearm or bicep takeover.', tutorial: ['Attach a straight bar to the high pulley.', 'Stand back slightly and grip the bar with straight arms.', 'Keep arms straight throughout — only move at the shoulder joint.', 'Pull the bar down in an arc toward your thighs.', 'Squeeze your lats hard at the bottom, then slowly return.'] },
    { id: 'back-8', name: 'Cable Face Pulls', sets: '4 Sets', reps: '15 Reps', rest: '45s Rest', equipment: 'Cable Rope', cue: 'Pull rope toward eye level while externally rotating hands back.', tutorial: ['Attach a rope to a cable at upper chest height.', 'Grip both ends of the rope with palms facing down.', 'Pull the rope toward your face, separating your hands.', 'Externally rotate your hands so thumbs point backward.', 'Squeeze rear delts and upper back, then slowly return.'] },
    { id: 'back-9', name: 'Hyperextensions (Back Extensions)', sets: '3 Sets', reps: '15 Reps', rest: '60s Rest', equipment: 'Hyperextension Bench', cue: 'Strengthen erector spinae and posterior chain with controlled tempo.', tutorial: ['Position yourself face-down on the hyperextension bench, ankles locked.', 'Cross your arms over your chest or behind your head.', 'Lower your torso toward the ground by bending at the hips.', 'Raise back up by contracting your lower back and glutes.', 'Stop when your body is in a straight line — do not hyperextend.'] },
    { id: 'back-10', name: 'Strict Bodyweight Pull-Ups', sets: '3 Sets', reps: 'Max Reps', rest: '90s Rest', equipment: 'Pull-Up Bar', cue: 'Full hang at bottom to chin-over-bar at top.', tutorial: ['Hang from a pull-up bar with an overhand grip, arms fully extended.', 'Engage your lats and core before initiating the pull.', 'Pull yourself upward until your chin clears the bar.', 'Lower yourself slowly to a full dead hang — no kipping.', 'Repeat for as many strict reps as possible.'] },
  ],
  Chest: [
    { id: 'chest-1', name: 'Incline Barbell Bench Press', sets: '4 Sets', reps: '8-10 Reps', rest: '90s Rest', equipment: 'Incline Bench & Bar', cue: 'Target upper clavicular pecs, touch upper chest and press vertically.', tutorial: ['Set an adjustable bench to 30-45 degree incline.', 'Lie back, grip barbell slightly wider than shoulder-width.', 'Unrack the bar and lower it slowly to your upper chest.', 'Press the bar upward in a slight arc until arms are fully locked.', 'Focus on squeezing upper pecs at the top of every rep.'] },
    { id: 'chest-2', name: 'Flat Dumbbell Press', sets: '4 Sets', reps: '8-10 Reps', rest: '90s Rest', equipment: 'Dumbbells & Bench', cue: 'Deep eccentric stretch at bottom, explosive converging press.', tutorial: ['Sit on a flat bench with dumbbells on your thighs.', 'Kick the dumbbells up as you lie back on the bench.', 'Hold dumbbells at chest level with palms facing forward.', 'Press up explosively, bringing dumbbells together at the top.', 'Lower slowly for a deep stretch at the bottom of each rep.'] },
    { id: 'chest-3', name: 'Weighted Chest Dips', sets: '3 Sets', reps: '10-12 Reps', rest: '75s Rest', equipment: 'Dip Station / Belt', cue: 'Slight 20-degree forward torso lean to load the lower chest.', tutorial: ['Mount the dip bars and add weight using a dip belt.', 'Lean your torso forward about 20 degrees.', 'Lower yourself by bending your elbows until upper arms are parallel to the floor.', 'Push yourself back up by extending your arms fully.', 'Keep the forward lean throughout to engage the lower chest.'] },
    { id: 'chest-4', name: 'Incline DB Flyes', sets: '3 Sets', reps: '12-15 Reps', rest: '60s Rest', equipment: 'Incline Bench', cue: 'Slight elbow bend, focus on wide pectoral stretch.', tutorial: ['Lie on an incline bench holding dumbbells above your chest.', 'Keep a slight bend in your elbows throughout the movement.', 'Open your arms wide, lowering dumbbells in a wide arc.', 'Feel a deep stretch across your pecs at the bottom.', 'Squeeze your chest to bring the dumbbells back together.'] },
    { id: 'chest-5', name: 'High-to-Low Cable Crossover', sets: '3 Sets', reps: '15 Reps', rest: '45s Rest', equipment: 'Dual Cable Pulley', cue: 'Cross hands slightly at bottom for extreme inner chest contraction.', tutorial: ['Set both cable pulleys to the highest position.', 'Stand in the center, grab one handle in each hand.', 'Step forward slightly and lean torso forward.', 'Bring your hands downward in a wide arc until they cross at your waist.', 'Squeeze inner chest hard at the bottom, then return slowly.'] },
    { id: 'chest-6', name: 'Low-to-High Cable Fly', sets: '3 Sets', reps: '15 Reps', rest: '45s Rest', equipment: 'Cable Pulleys', cue: 'Sweep upward in an arc toward chin level to build upper inner pecs.', tutorial: ['Set both cable pulleys to the lowest position.', 'Grab the handles and stand in the center.', 'With a slight elbow bend, sweep your hands upward in an arc.', 'Bring hands together at chin level, squeezing upper chest.', 'Lower slowly back to the starting position.'] },
    { id: 'chest-7', name: 'Machine Chest Press (Drop Set)', sets: '3 Sets', reps: '10-12 Reps', rest: '60s Rest', equipment: 'Chest Press Machine', cue: 'Constant continuous mechanical tension with no dead spots.', tutorial: ['Adjust the seat so handles align with mid-chest.', 'Press handles forward until arms are fully extended.', 'Slowly return to start position — do not let the weight stack touch.', 'On the last set, drop the weight by 30% and continue to failure.'] },
    { id: 'chest-8', name: 'Pec Deck Machine Fly', sets: '3 Sets', reps: '12-15 Reps', rest: '60s Rest', equipment: 'Pec Deck', cue: 'Strict 1-second pause when handles meet in front of chest.', tutorial: ['Adjust the seat and arm pads to chest height.', 'Sit with your back flat against the pad.', 'Bring the handles together in front of your chest.', 'Hold the contraction for 1 full second.', 'Slowly open arms back to the starting position.'] },
    { id: 'chest-9', name: 'Deficit Push-Up Burnout', sets: '3 Sets', reps: 'To Failure', rest: '45s Rest', equipment: 'Bodyweight / Plates', cue: 'Deep deficit stretch, push until total muscle pump exhaustion.', tutorial: ['Place your hands on two weight plates or raised surfaces.', 'Get into a push-up position with a wider hand placement.', 'Lower your chest below hand level for a deep stretch.', 'Push back up explosively until arms are extended.', 'Continue reps until total failure.'] },
  ],
  Legs: [
    { id: 'legs-1', name: 'Barbell Back Squat', sets: '4 Sets', reps: '6-8 Reps', rest: '120s Rest', equipment: 'Squat Rack & Barbell', cue: 'Break parallel depth, push knees out over toes and drive up.', tutorial: ['Set up the barbell at shoulder height in a squat rack.', 'Step under the bar, position it on your upper traps.', 'Unrack and step back, feet shoulder-width apart, toes slightly out.', 'Brace your core, push your hips back and bend your knees.', 'Descend until your thighs break parallel with the floor.', 'Drive up through your heels, pushing knees outward.'] },
    { id: 'legs-2', name: 'Romanian Deadlift (RDL)', sets: '4 Sets', reps: '8-10 Reps', rest: '90s Rest', equipment: 'Barbell / Dumbbells', cue: 'Push hips backward with soft knees, feel deep hamstring loading.', tutorial: ['Stand holding a barbell or dumbbells at hip height.', 'Keep a slight bend in your knees throughout.', 'Push your hips backward, lowering the weight along your legs.', 'Go down until you feel a deep hamstring stretch (roughly mid-shin).', 'Drive your hips forward to return to standing.', 'Keep your back flat and core braced at all times.'] },
    { id: 'legs-3', name: '45° Leg Press (Heavy)', sets: '4 Sets', reps: '10-12 Reps', rest: '90s Rest', equipment: 'Leg Press Sled', cue: 'Full range without lifting lower back off seat pad.', tutorial: ['Sit in the leg press machine with back flat against the pad.', 'Place feet shoulder-width apart on the platform.', 'Release the safety catches and lower the sled.', 'Bend your knees to 90 degrees without your lower back lifting.', 'Press the sled back up without locking your knees at the top.'] },
    { id: 'legs-4', name: 'Bulgarian Split Squat', sets: '3 Sets', reps: '10 Reps/Leg', rest: '75s Rest', equipment: 'Dumbbells & Bench', cue: 'Unilateral quad & glute builder, maintain balanced upright posture.', tutorial: ['Stand about 2 feet in front of a bench with dumbbells.', 'Place the top of one foot on the bench behind you.', 'Lower your body by bending your front knee to 90 degrees.', 'Keep your torso upright and front knee tracking over your toes.', 'Drive up through your front heel to return to start.', 'Complete all reps on one leg before switching.'] },
    { id: 'legs-5', name: 'Seated Leg Extensions', sets: '4 Sets', reps: '12-15 Reps', rest: '60s Rest', equipment: 'Leg Extension Machine', cue: 'Lock out knees at top and hold for 1 count before slow descent.', tutorial: ['Sit on the leg extension machine, pad on your lower shins.', 'Grip the side handles for stability.', 'Extend your legs upward until knees are fully locked.', 'Hold the top contraction for 1 second.', 'Lower the weight slowly with a 3-second negative.'] },
    { id: 'legs-6', name: 'Lying Hamstring Curls', sets: '4 Sets', reps: '10-12 Reps', rest: '60s Rest', equipment: 'Hamstring Curl Machine', cue: 'Keep hips pinned to pad, slow 3-second negative eccentric phase.', tutorial: ['Lie face down on the hamstring curl machine.', 'Position the pad just above your ankles.', 'Keep your hips pressed firmly into the bench pad.', 'Curl your legs up toward your glutes by bending at the knees.', 'Lower slowly with a 3-second eccentric phase.'] },
    { id: 'legs-7', name: 'Walking Dumbbell Lunges', sets: '3 Sets', reps: '20 Steps', rest: '60s Rest', equipment: 'Dumbbells', cue: 'Long strides for glute and quad hypertrophy.', tutorial: ['Stand holding dumbbells at your sides.', 'Take a large step forward and lower your back knee toward the ground.', 'Push off your front foot and step forward with the other leg.', 'Continue walking forward, alternating legs.', 'Keep your torso upright and core braced throughout.'] },
    { id: 'legs-8', name: 'Standing Heavy Calf Raises', sets: '4 Sets', reps: '15-20 Reps', rest: '45s Rest', equipment: 'Calf Machine', cue: 'Deep stretch at bottom, rise high on balls of big toes.', tutorial: ['Stand on the calf raise machine with the balls of your feet on the platform.', 'Let your heels drop below the platform for a full stretch.', 'Push up onto your toes as high as possible.', 'Hold the top contraction for 1 second.', 'Lower slowly back to the stretched position.'] },
    { id: 'legs-9', name: 'Seated Calf Raises', sets: '3 Sets', reps: '15 Reps', rest: '45s Rest', equipment: 'Seated Calf Machine', cue: 'Directly targets soleus muscle under knee flexion.', tutorial: ['Sit on the seated calf machine with the pad on your lower thighs.', 'Place the balls of your feet on the platform.', 'Release the safety lever and let your heels drop for a stretch.', 'Push up onto your toes as high as you can.', 'Lower slowly and repeat.'] },
    { id: 'legs-10', name: 'Hack Squat Machine', sets: '3 Sets', reps: '8-10 Reps', rest: '90s Rest', equipment: 'Hack Squat', cue: 'Place feet low on platform for maximum quadriceps isolation.', tutorial: ['Step into the hack squat machine, back against the pad.', 'Place feet low and close together on the platform.', 'Release the safety catches and lower the sled.', 'Descend until your thighs are at or below parallel.', 'Press back up through your quads without locking knees.'] },
    { id: 'legs-11', name: 'Barbell Hip Thrust', sets: '3 Sets', reps: '10-12 Reps', rest: '75s Rest', equipment: 'Barbell & Bench', cue: 'Chin tucked, squeeze glutes hard at the top lockout.', tutorial: ['Sit on the ground with your upper back against a bench.', 'Roll a barbell over your legs to your hip crease.', 'Place feet flat on the floor about hip-width apart.', 'Drive through your heels to lift your hips until your body forms a straight line.', 'Squeeze your glutes hard at the top with chin tucked.', 'Lower your hips back down under control.'] },
    { id: 'legs-12', name: 'Sissy Squat / Quad Burn', sets: '2 Sets', reps: '15 Reps', rest: '45s Rest', equipment: 'Bodyweight', cue: 'Lean back, knees forward for final quad pump burnout.', tutorial: ['Stand holding onto a rack or pole for balance.', 'Rise onto your toes and push your knees forward.', 'Lean your torso backward as you bend your knees deeply.', 'Lower until you feel an intense quad stretch.', 'Push back up through your quads to the starting position.'] },
  ],
  Shoulder: [
    { id: 'sh-1', name: 'Standing Overhead Barbell Press', sets: '4 Sets', reps: '6-8 Reps', rest: '90s Rest', equipment: 'Barbell', cue: 'Brace core and glutes, press bar straight up locking arms overhead.', tutorial: ['Unrack a barbell at collar-bone height in a squat rack.', 'Stand with feet hip-width apart, grip just outside shoulders.', 'Brace your core and squeeze your glutes.', 'Press the bar straight overhead, moving your head out of the way.', 'Lock out your arms fully at the top.', 'Lower the bar back to your collar-bone under control.'] },
    { id: 'sh-2', name: 'Dumbbell Lateral Raises', sets: '4 Sets', reps: '12-15 Reps', rest: '45s Rest', equipment: 'Dumbbells', cue: 'Slight forward torso tilt, lead movement with elbows up to shoulder level.', tutorial: ['Stand holding dumbbells at your sides.', 'Tilt your torso forward slightly.', 'Raise both arms out to the sides, leading with your elbows.', 'Lift until your arms are at shoulder height.', 'Lower slowly and repeat. Avoid swinging or using momentum.'] },
    { id: 'sh-3', name: 'Seated Dumbbell Shoulder Press', sets: '3 Sets', reps: '8-10 Reps', rest: '75s Rest', equipment: 'Dumbbells & Bench', cue: 'Press up in a smooth arc without clanking dumbbells together.', tutorial: ['Sit on a bench set to 90 degrees with back support.', 'Hold dumbbells at shoulder height, palms facing forward.', 'Press both dumbbells upward in a smooth arc.', 'Extend arms fully without clanking the dumbbells.', 'Lower slowly back to shoulder height.'] },
    { id: 'sh-4', name: 'Behind-Back Cable Lateral Raise', sets: '3 Sets', reps: '12-15 Reps', rest: '45s Rest', equipment: 'Cable Pulley', cue: 'Constant tension across the entire lateral head arc.', tutorial: ['Set a cable to the lowest position.', 'Stand sideways to the machine, cable behind your back.', 'Grab the handle with the far hand behind your body.', 'Raise your arm out to the side until shoulder height.', 'Lower under control and repeat. Switch sides.'] },
    { id: 'sh-5', name: 'Reverse Pec Deck (Rear Delts)', sets: '4 Sets', reps: '15 Reps', rest: '45s Rest', equipment: 'Rear Delt Fly Machine', cue: 'Keep arms parallel to floor, isolate posterior deltoid.', tutorial: ['Sit facing the pec deck machine pad.', 'Adjust handles so they are at shoulder height.', 'Grip the handles with arms extended in front.', 'Open your arms wide, squeezing your rear delts.', 'Slowly return to the starting position.'] },
    { id: 'sh-6', name: 'Arnold Dumbbell Press', sets: '3 Sets', reps: '10-12 Reps', rest: '60s Rest', equipment: 'Dumbbells', cue: 'Rotate wrists from supinated to pronated as you press upward.', tutorial: ['Sit on a bench holding dumbbells at shoulder height, palms facing you.', 'As you press upward, rotate your wrists so palms face forward at the top.', 'Fully extend your arms overhead.', 'Reverse the rotation as you lower the dumbbells back down.', 'This rotation hits all three delt heads.'] },
    { id: 'sh-7', name: 'Heavy Dumbbell Shrugs', sets: '4 Sets', reps: '12-15 Reps', rest: '45s Rest', equipment: 'Dumbbells', cue: 'Elevate traps straight up towards ears, hold peak squeeze for 2 seconds.', tutorial: ['Stand holding heavy dumbbells at your sides.', 'Keep your arms straight throughout the movement.', 'Shrug your shoulders straight up toward your ears.', 'Hold the peak contraction for 2 full seconds.', 'Lower slowly and repeat.'] },
  ],
  Biceps: [
    { id: 'bi-1', name: 'Standing EZ-Bar Bicep Curl', sets: '4 Sets', reps: '8-10 Reps', rest: '75s Rest', equipment: 'EZ Barbell', cue: 'Keep upper arms glued to sides, curl without swinging hips or shoulders.', tutorial: ['Stand holding an EZ bar with an underhand grip.', 'Keep your elbows pinned to your sides.', 'Curl the bar upward by flexing your biceps.', 'Squeeze at the top for 1 second.', 'Lower slowly — do not swing your body or use momentum.'] },
    { id: 'bi-2', name: 'Incline Dumbbell Curl', sets: '3 Sets', reps: '10-12 Reps', rest: '60s Rest', equipment: 'Incline Bench & DBs', cue: 'Deep stretch at bottom, supinate wrists outward at peak contraction.', tutorial: ['Set an adjustable bench to 45 degrees.', 'Sit back with dumbbells hanging at arm\'s length.', 'Curl the dumbbells up while rotating your wrists outward.', 'Squeeze your biceps hard at the top.', 'Lower slowly to get a deep stretch at the bottom.'] },
    { id: 'bi-3', name: 'Hammer Curls (Dumbbell)', sets: '4 Sets', reps: '10-12 Reps', rest: '60s Rest', equipment: 'Dumbbells', cue: 'Neutral grip throughout to build the brachialis and forearm size.', tutorial: ['Stand holding dumbbells at your sides with a neutral (palms facing in) grip.', 'Keep your elbows pinned and curl both dumbbells upward.', 'Maintain the neutral grip throughout — do not rotate.', 'Squeeze at the top, then lower under control.'] },
    { id: 'bi-4', name: 'Preacher Curl (EZ-Bar / Machine)', sets: '3 Sets', reps: '10-12 Reps', rest: '60s Rest', equipment: 'Preacher Bench', cue: 'Armpits flush against pad, strict isolation removing shoulder momentum.', tutorial: ['Sit at a preacher bench with armpits flush against the top of the pad.', 'Grip the EZ bar with an underhand grip.', 'Lower the bar slowly until arms are almost fully extended.', 'Curl the bar back up, squeezing your biceps.', 'Do not lift your arms off the pad at any point.'] },
    { id: 'bi-5', name: 'Cable Concentration Curls', sets: '3 Sets', reps: '12-15 Reps', rest: '45s Rest', equipment: 'Low Cable Pulley', cue: 'Anchor elbow against inner thigh, peak bicep squeeze at the top.', tutorial: ['Set a cable to the lowest position with a single handle.', 'Sit on a bench, lean forward, and brace your elbow against your inner thigh.', 'Curl the handle upward, squeezing your bicep at the top.', 'Lower slowly back to the starting position.', 'Complete all reps on one arm before switching.'] },
    { id: 'bi-6', name: 'Spider Curls (Incline Bench)', sets: '3 Sets', reps: '12 Reps', rest: '45s Rest', equipment: 'EZ Bar & Incline Bench', cue: 'Torso supported on bench, arms hang vertical for max short head isolation.', tutorial: ['Lean your chest against the incline side of a preacher or incline bench.', 'Let your arms hang straight down holding an EZ bar.', 'Curl the bar upward, keeping your upper arms vertical.', 'Squeeze the bicep at the top, then lower slowly.', 'The bench support prevents any cheating.'] },
  ],
  Abs: [
    { id: 'ab-1', name: 'Hanging Leg Raises', sets: '4 Sets', reps: '12-15 Reps', rest: '60s Rest', equipment: 'Pull-Up Bar', cue: 'Curl pelvis forward and up to chin height, avoid relying on hip flexors.', tutorial: ['Hang from a pull-up bar with arms fully extended.', 'Keep your legs straight or slightly bent.', 'Curl your pelvis upward, raising your legs toward the bar.', 'Focus on using your abs, not hip flexors.', 'Lower your legs slowly under control.'] },
    { id: 'ab-2', name: 'Standing Cable Woodchoppers', sets: '3 Sets', reps: '15 Reps/Side', rest: '45s Rest', equipment: 'High Cable Pulley', cue: 'Rotate torso dynamically through obliques while hips stay stable.', tutorial: ['Set a cable to the highest position.', 'Stand sideways to the machine, grip the handle with both hands.', 'Keep your hips stable and rotate your torso downward and across.', 'Pull the cable from high to low in a chopping motion.', 'Return slowly and repeat. Switch sides after all reps.'] },
    { id: 'ab-3', name: 'Ab Wheel Rollout', sets: '3 Sets', reps: '10-12 Reps', rest: '60s Rest', equipment: 'Ab Wheel', cue: 'Roll out with glutes braced, pull back using core compression.', tutorial: ['Kneel on the floor holding an ab wheel with both hands.', 'Brace your glutes and core before starting.', 'Roll the wheel forward, extending your body.', 'Go as far as you can while keeping your back flat.', 'Pull yourself back to the starting position using your abs.'] },
    { id: 'ab-4', name: 'Decline Bench Weighted Crunch', sets: '3 Sets', reps: '15 Reps', rest: '45s Rest', equipment: 'Decline Bench & Plate', cue: 'Hold weight plate across chest, flex spine curling upward.', tutorial: ['Lock your legs on a decline bench and lie back.', 'Hold a weight plate across your chest.', 'Crunch upward by flexing your spine, lifting your shoulders.', 'Squeeze your abs at the top, then lower slowly.'] },
    { id: 'ab-5', name: 'Plank with Shoulder Taps', sets: '3 Sets', reps: '45-60 Sec', rest: '45s Rest', equipment: 'Exercise Mat', cue: 'Anti-rotational stability, keep hips completely horizontal.', tutorial: ['Get into a high plank position on your hands.', 'Keep your body in a straight line, core braced.', 'Lift one hand and tap the opposite shoulder.', 'Replace the hand and tap with the other side.', 'Keep your hips completely still — no rocking.'] },
    { id: 'ab-6', name: 'Seated Russian Twists (Weighted)', sets: '3 Sets', reps: '20 Reps', rest: '45s Rest', equipment: 'Medicine Ball / DB', cue: 'Elevate feet 6 inches off ground, rotate shoulders fully each side.', tutorial: ['Sit on the floor with knees bent, holding a weight.', 'Lean back slightly and lift your feet 6 inches off the ground.', 'Rotate your torso to one side, tapping the weight to the floor.', 'Rotate to the other side — that is one rep.', 'Keep your core engaged throughout.'] },
    { id: 'ab-7', name: 'Kneeling Cable Rope Crunch', sets: '4 Sets', reps: '15-20 Reps', rest: '45s Rest', equipment: 'Cable Rope Pulley', cue: 'Keep hips locked, curl spine bringing elbows down to touch knees.', tutorial: ['Attach a rope to the high pulley and kneel facing the machine.', 'Hold the rope behind your head.', 'Keep your hips locked in place throughout.', 'Crunch downward by curling your spine, bringing elbows toward knees.', 'Squeeze your abs, then slowly extend back up.'] },
    { id: 'ab-8', name: 'Hollow Body Hold', sets: '3 Sets', reps: '30-45 Sec', rest: '30s Rest', equipment: 'Bodyweight Mat', cue: 'Lower back pressed flat against ground, arms and legs extended.', tutorial: ['Lie flat on your back on a mat.', 'Extend your arms overhead and your legs straight out.', 'Press your lower back firmly into the floor.', 'Lift your arms, shoulders, and legs slightly off the ground.', 'Hold this hollow position for the prescribed time.'] },
  ],
};

const workoutImages: Record<string, any> = {
  Triceps: require('./assets/triceps.jpg'),
  Back: require('./assets/back.jpg'),
  Chest: require('./assets/chest.jpg'),
  Legs: require('./assets/legs.jpg'),
  Shoulder: require('./assets/shoulder.jpg'),
  Biceps: require('./assets/biceps.jpg'),
  Abs: require('./assets/abs.jpg'),
};

function StripeHeader({ height = 13, style }: { height?: number; style?: any }) {
  const lineCount = 50;
  return (
    <View style={[styles.stripeHeader, { height }, style]}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        {Array.from({ length: lineCount }, (_, i) => {
          const x = i * 11 - 25;
          return (
            <Line
              key={i}
              x1={x}
              y1={height + 6}
              x2={x + height + 6}
              y2={-6}
              stroke="#3a3c45"
              strokeWidth={3.8}
              strokeLinecap="square"
            />
          );
        })}
      </Svg>
    </View>
  );
}

function ExerciseTutorialModal({
  exercise,
  workout,
  onClose,
  isCompleted,
  toggleExercise,
}: {
  exercise: ExerciseItem | null;
  workout: WorkoutSection;
  onClose: () => void;
  isCompleted: boolean;
  toggleExercise: (id: string) => void;
}) {
  if (!exercise) return null;

  return (
    <Modal
      visible={exercise !== null}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.tutorialContainer}>
        <StatusBar style="light" />

        {/* Floating Top Nav Bar */}
        <SafeAreaView style={styles.tutorialNavBar}>
          <Pressable onPress={onClose} style={styles.tutorialCloseBtn}>
            <Ionicons name="close" size={20} color="#ffffff" />
          </Pressable>
          <View style={styles.tutorialNavCenter}>
            <Text style={styles.tutorialNavHeading}>EXERCISE TUTORIAL</Text>
            <Text style={[styles.tutorialNavSub, { color: workout.color }]}>
              {workout.name.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.tutorialCategoryBadge, { backgroundColor: workout.color }]}>
            <Ionicons name={workout.icon as any} size={12} color="#ffffff" />
          </View>
        </SafeAreaView>

        <ScrollView
          contentContainerStyle={styles.tutorialScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Edge-to-Edge Hero Banner */}
          <View style={styles.tutorialHero}>
            {workoutImages[workout.name] ? (
              <Image source={workoutImages[workout.name]} style={styles.tutorialHeroImage} />
            ) : (
              <View style={[styles.tutorialHeroImage, { backgroundColor: workout.color }]} />
            )}
            <LinearGradient
              colors={['rgba(7,9,14,0.15)', 'rgba(7,9,14,0.85)', '#07090e']}
              style={styles.tutorialHeroGradient}
            />

            <View style={styles.tutorialHeroContent}>
              <View style={[styles.tutorialEquipBadge, { borderColor: `${workout.color}80` }]}>
                <Ionicons name="hardware-chip-outline" size={11} color={workout.color} />
                <Text style={[styles.tutorialEquipText, { color: workout.color }]}>
                  {exercise.equipment.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.tutorialTitle}>{exercise.name}</Text>
            </View>
          </View>

          <View style={styles.tutorialBody}>
            {/* Quick Specs 4-Box Grid */}
            <View style={styles.tutorialSpecsGrid}>
              <View style={styles.tutorialSpecCard}>
                <Ionicons name="repeat" size={16} color={workout.color} />
                <Text style={styles.tutorialSpecLabel}>SETS</Text>
                <Text style={styles.tutorialSpecValue}>{exercise.sets}</Text>
              </View>
              <View style={styles.tutorialSpecCard}>
                <Ionicons name="flash" size={16} color={workout.color} />
                <Text style={styles.tutorialSpecLabel}>REPS</Text>
                <Text style={styles.tutorialSpecValue}>{exercise.reps}</Text>
              </View>
              <View style={styles.tutorialSpecCard}>
                <Ionicons name="timer" size={16} color={workout.color} />
                <Text style={styles.tutorialSpecLabel}>REST</Text>
                <Text style={styles.tutorialSpecValue}>{exercise.rest}</Text>
              </View>
              <View style={styles.tutorialSpecCard}>
                <Ionicons
                  name={isCompleted ? 'checkmark-circle' : 'time-outline'}
                  size={16}
                  color={isCompleted ? '#10e575' : workout.color}
                />
                <Text style={styles.tutorialSpecLabel}>STATUS</Text>
                <Text
                  style={[
                    styles.tutorialSpecValue,
                    { color: isCompleted ? '#10e575' : '#ffffff' },
                  ]}
                >
                  {isCompleted ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>

            {/* Pro Coach Form Cue Callout */}
            <View style={[styles.tutorialCueBox, { borderColor: `${workout.color}45` }]}>
              <View style={styles.tutorialCueHeader}>
                <View style={[styles.tutorialCueIcon, { backgroundColor: `${workout.color}25` }]}>
                  <Ionicons name="bulb" size={16} color={workout.color} />
                </View>
                <Text style={[styles.tutorialCueTitle, { color: workout.color }]}>PRO FORM CUE</Text>
              </View>
              <Text style={styles.tutorialCueText}>{exercise.cue}</Text>
            </View>

            {/* Step-by-Step Instructions */}
            <View style={styles.tutorialSectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="list" size={18} color="#ffffff" />
                <Text style={styles.tutorialSectionTitle}>HOW TO PERFORM</Text>
              </View>
              <Text style={styles.tutorialStepCount}>{exercise.tutorial.length} STEPS</Text>
            </View>

            <View style={styles.tutorialStepsList}>
              {exercise.tutorial.map((step, idx) => (
                <View key={idx} style={styles.tutorialStepItem}>
                  <View
                    style={[
                      styles.tutorialStepNumberBadge,
                      { borderColor: workout.color, backgroundColor: `${workout.color}15` },
                    ]}
                  >
                    <Text style={[styles.tutorialStepNumberText, { color: workout.color }]}>
                      {idx + 1}
                    </Text>
                  </View>
                  <View style={styles.tutorialStepContent}>
                    <Text style={styles.tutorialStepLabel}>STEP {idx + 1}</Text>
                    <Text style={styles.tutorialStepDesc}>{step}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Floating Bottom Action Bar */}
        <LinearGradient
          colors={['transparent', 'rgba(7,9,14,0.95)', '#07090e']}
          style={styles.tutorialBottomBar}
        >
          <Pressable
            onPress={() => toggleExercise(exercise.id)}
            style={({ pressed }) => [
              styles.tutorialActionBtn,
              isCompleted
                ? { backgroundColor: '#10e575' }
                : { backgroundColor: workout.color },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Ionicons
              name={isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={20}
              color={isCompleted ? '#000000' : '#ffffff'}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.tutorialActionBtnText,
                isCompleted && { color: '#000000' },
              ]}
            >
              {isCompleted ? 'COMPLETED • TAP TO UNDO' : 'MARK AS COMPLETED'}
            </Text>
          </Pressable>
        </LinearGradient>
      </View>
    </Modal>
  );
}

function WorkoutModal({
  selectedWorkout,
  setSelectedWorkout,
  completedExercises,
  toggleExercise,
  logToday,
}: {
  selectedWorkout: WorkoutSection | null;
  setSelectedWorkout: (section: WorkoutSection | null) => void;
  completedExercises: Set<string>;
  toggleExercise: (id: string) => void;
  logToday: () => void;
}) {
  const [selectedExerciseForTutorial, setSelectedExerciseForTutorial] = useState<ExerciseItem | null>(null);

  return (
    <Modal
      visible={selectedWorkout !== null}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => {
        setSelectedExerciseForTutorial(null);
        setSelectedWorkout(null);
      }}
    >
      {selectedWorkout && (
        <View style={styles.modalNewContainer}>
          <StatusBar style="light" />
          
          <ScrollView contentContainerStyle={styles.modalNewScrollContent} showsVerticalScrollIndicator={false} bounces={false}>
            {/* Edge-to-Edge Hero Banner */}
            <View style={styles.modalNewHero}>
              {workoutImages[selectedWorkout.name] ? (
                <Image source={workoutImages[selectedWorkout.name]} style={styles.modalNewHeroImage} />
              ) : (
                <View style={[styles.modalNewHeroImage, { backgroundColor: selectedWorkout.color }]} />
              )}
              <LinearGradient 
                colors={['rgba(7,9,14,0.1)', 'rgba(7,9,14,0.8)', '#07090e']} 
                style={styles.modalNewHeroGradient} 
              />
              
              {/* Floating Nav */}
              <SafeAreaView style={styles.modalNewNavBar}>
                <Pressable onPress={() => setSelectedWorkout(null)} style={styles.modalNewCloseButton}>
                  <Ionicons name="close" size={20} color="#ffffff" />
                </Pressable>
                <View style={[styles.modalNewCategoryPill, { backgroundColor: selectedWorkout.color }]}>
                  <Ionicons name={selectedWorkout.icon as any} size={12} color="#ffffff" />
                  <Text style={styles.modalNewCategoryText}>{selectedWorkout.category.toUpperCase()}</Text>
                </View>
              </SafeAreaView>

              {/* Hero Content positioned over gradient */}
              <View style={styles.modalNewHeroContent}>
                <Text style={styles.modalNewHeroTitle}>{selectedWorkout.name.toUpperCase()}</Text>
                <Text style={styles.modalNewHeroDesc}>{selectedWorkout.description}</Text>
                
                <View style={styles.modalNewStatsRow}>
                  <View style={styles.modalNewStatBox}>
                    <Ionicons name="barbell" size={16} color={selectedWorkout.color} />
                    <View>
                      <Text style={styles.modalNewStatLabel}>Exercises</Text>
                      <Text style={styles.modalNewStatValue}>{selectedWorkout.exercises}</Text>
                    </View>
                  </View>
                  <View style={styles.modalNewStatBox}>
                    <Ionicons name="time" size={16} color={selectedWorkout.color} />
                    <View>
                      <Text style={styles.modalNewStatLabel}>Duration</Text>
                      <Text style={styles.modalNewStatValue}>{selectedWorkout.minutes}m</Text>
                    </View>
                  </View>
                  <View style={styles.modalNewStatBox}>
                    <Ionicons name="flame" size={16} color={selectedWorkout.color} />
                    <View>
                      <Text style={styles.modalNewStatLabel}>Total Sets</Text>
                      <Text style={styles.modalNewStatValue}>{selectedWorkout.sets}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Content Body */}
            <View style={styles.modalNewBody}>
              {/* Progress Tracker */}
              {(() => {
                const list = workoutExercises[selectedWorkout.name] || [];
                const doneCount = list.filter((item) => completedExercises.has(item.id)).length;
                const progressPct = list.length > 0 ? (doneCount / list.length) * 100 : 0;
                return (
                  <View style={styles.modalNewProgressContainer}>
                    <View style={styles.modalNewProgressHeader}>
                      <Text style={styles.modalNewProgressTitle}>Workout Progress</Text>
                      <Text style={[styles.modalNewProgressCount, { color: selectedWorkout.color }]}>{doneCount}/{list.length}</Text>
                    </View>
                    <View style={styles.modalNewProgressBarBg}>
                      <View style={[styles.modalNewProgressBarFill, { width: `${progressPct}%`, backgroundColor: selectedWorkout.color }]} />
                    </View>
                  </View>
                );
              })()}

              <View style={styles.modalExercisesHeaderRow}>
                <Text style={styles.modalNewListTitle}>Exercises</Text>
                <Text style={styles.modalExercisesHint}>TAP CARD FOR TUTORIAL</Text>
              </View>

              {/* Half-width Exercise Cards Grid */}
              <View style={styles.halfGridContainer}>
                {(workoutExercises[selectedWorkout.name] || []).map((exercise, index) => {
                  const isCompleted = completedExercises.has(exercise.id);
                  return (
                    <Pressable
                      key={exercise.id}
                      onPress={() => setSelectedExerciseForTutorial(exercise)}
                      style={({ pressed }) => [
                        styles.halfWorkoutCard,
                        isCompleted && styles.halfWorkoutCardCompleted,
                        pressed && styles.cardPressed,
                      ]}
                    >
                      {/* Striped Diagonal Header like the original workout cards */}
                      <StripeHeader height={10} style={styles.halfCardStripe} />

                      {/* Visual / Image area like the original workout cards */}
                      <View style={styles.halfCardVisual}>
                        {workoutImages[selectedWorkout.name] ? (
                          <Image
                            source={workoutImages[selectedWorkout.name]}
                            style={styles.halfCardImage}
                          />
                        ) : (
                          <View
                            style={[
                              styles.halfCardImage,
                              { backgroundColor: selectedWorkout.color },
                            ]}
                          />
                        )}
                        <View style={styles.halfCardVisualOverlay} />

                        {/* Index Badge */}
                        <View style={styles.halfCardIndexBadge}>
                          <Text style={styles.halfCardIndexText}>
                            #{index + 1 < 10 ? `0${index + 1}` : index + 1}
                          </Text>
                        </View>

                        {/* Direct completion toggle checkmark */}
                        <Pressable
                          hitSlop={8}
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleExercise(exercise.id);
                          }}
                          style={[
                            styles.halfCardCheckCircle,
                            isCompleted && styles.halfCardCheckCircleCompleted,
                          ]}
                        >
                          <Ionicons
                            name={isCompleted ? 'checkmark' : 'add'}
                            size={12}
                            color={isCompleted ? '#000000' : '#ffffff'}
                          />
                        </Pressable>

                        {/* Sets badge on visual */}
                        <View
                          style={[
                            styles.halfCardSetsBadge,
                            isCompleted && { backgroundColor: '#10e575' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.halfCardSetsBadgeText,
                              isCompleted && { color: '#000000' },
                            ]}
                          >
                            {exercise.sets.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      {/* Card Info Body */}
                      <View style={styles.halfCardContent}>
                        {/* Equipment Category pill */}
                        <View
                          style={[
                            styles.halfCategoryPill,
                            { backgroundColor: `${selectedWorkout.color}25` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.halfCategoryText,
                              { color: selectedWorkout.color },
                            ]}
                            numberOfLines={1}
                          >
                            {exercise.equipment.toUpperCase()}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.halfCardTitle,
                            isCompleted && styles.halfCardTitleCompleted,
                          ]}
                          numberOfLines={2}
                        >
                          {exercise.name.toUpperCase()}
                        </Text>

                        <Text style={styles.halfCardMeta} numberOfLines={1}>
                          {exercise.reps} <Text style={styles.separator}>|</Text> {exercise.rest}
                        </Text>

                        {/* View Tutorial Footer Badge */}
                        <View style={styles.halfCardFooterRow}>
                          <View style={styles.halfViewBadge}>
                            <Ionicons name="book-outline" size={10} color="#ffffff" />
                            <Text style={styles.halfViewBadgeText}>TUTORIAL</Text>
                            <Ionicons name="chevron-forward" size={10} color="#ffffff" />
                          </View>
                          {isCompleted ? (
                            <Ionicons name="checkmark-done" size={14} color="#10e575" />
                          ) : null}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Sticky Floating Action Button */}
          <LinearGradient
            colors={['transparent', 'rgba(7,9,14,0.9)', '#07090e']}
            style={styles.modalNewFabContainer}
          >
            <Pressable
              onPress={() => {
                logToday();
                setSelectedWorkout(null);
              }}
              style={({pressed}) => [
                styles.modalNewFab, 
                { backgroundColor: selectedWorkout.color },
                pressed && { opacity: 0.8 }
              ]}
            >
              <Ionicons name="checkmark-done" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.modalNewFabText}>Log Workout</Text>
            </Pressable>
          </LinearGradient>

          {/* Full Tutorial Modal on Exercise Click */}
          <ExerciseTutorialModal
            exercise={selectedExerciseForTutorial}
            workout={selectedWorkout}
            onClose={() => setSelectedExerciseForTutorial(null)}
            isCompleted={
              selectedExerciseForTutorial
                ? completedExercises.has(selectedExerciseForTutorial.id)
                : false
            }
            toggleExercise={toggleExercise}
          />
        </View>
      )}
    </Modal>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_600SemiBold,
    NotoSans_700Bold,
    NotoSans_800ExtraBold,
    NotoSans_900Black,
  });

  const calendarScrollRef = useRef<ScrollView>(null);
  const confettiRef = useRef<any>(null);
  const [completedDays, setCompletedDays] = useState<Set<string>>(() => new Set());
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSection | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(() => new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('formfit-streak-days'),
      AsyncStorage.getItem('formfit-completed-exercises'),
    ])
      .then(([storedDays, storedExercises]) => {
        if (storedDays) {
          const parsedDays: unknown = JSON.parse(storedDays);
          if (Array.isArray(parsedDays) && parsedDays.every((day) => typeof day === 'string')) {
            setCompletedDays(new Set(parsedDays));
          }
        }
        if (storedExercises) {
          const parsedEx: unknown = JSON.parse(storedExercises);
          if (Array.isArray(parsedEx) && parsedEx.every((item) => typeof item === 'string')) {
            setCompletedExercises(new Set(parsedEx));
          }
        }
      })
      .catch(() => undefined)
      .finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (isHydrated) {
      AsyncStorage.setItem('formfit-streak-days', JSON.stringify([...completedDays])).catch(() => undefined);
      AsyncStorage.setItem('formfit-completed-exercises', JSON.stringify([...completedExercises])).catch(() => undefined);
    }
  }, [completedDays, completedExercises, isHydrated]);

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises((current) => {
      const next = new Set(current);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  };

  useEffect(() => {
    const currentMonth = Math.min(new Date().getMonth(), monthNames.length - 1);
    const timeout = setTimeout(() => {
      calendarScrollRef.current?.scrollTo({ x: Math.max(0, currentMonth * 168 - 10), animated: false });
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const toggleDay = (dateKey: string) => {
    setCompletedDays((currentDays) => {
      const nextDays = new Set(currentDays);
      if (nextDays.has(dateKey)) nextDays.delete(dateKey);
      else nextDays.add(dateKey);
      return nextDays;
    });
  };

  const logToday = () => {
    toggleDay(`${calendarYear}-8-4`);
    confettiRef.current?.start();
  };

  const graphDates = Array.from({ length: 70 }, (_, index) => {
    const date = new Date(calendarYear, 8, 4);
    date.setDate(date.getDate() - (69 - index));
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  });
  const graphWeeks = Array.from({ length: 10 }, (_, weekIndex) => graphDates.slice(weekIndex * 7, weekIndex * 7 + 7));

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandGroup}>
            <Image source={require('./assets/icon.png')} style={styles.logo} />
            <View>
              <Text style={styles.brand}>FORM<Text style={styles.brandAccent}>FIT</Text></Text>
              <Text style={styles.tagline}>PRO PERFORMANCE</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.actionButton}><Text style={styles.actionText}>?</Text></View>
            <View style={styles.actionButton}><Text style={styles.actionText}>•••</Text></View>
          </View>
        </View>
        <View style={styles.telemetry}>
          <StripeHeader height={14} />
          <View style={styles.telemetryContent}>
            <View style={styles.telemetryTop}>
              <View>
                <Text style={styles.streakLabel}>🔥  CURRENT STREAK</Text>
                <Text style={styles.telemetryValue}>{(completedDays.size / 4.08).toFixed(1)}<Text style={styles.telemetryUnit}> / 20 DAYS</Text></Text>
                <Text style={styles.consistency}>i  {Math.round((completedDays.size / 20) * 100)}% consistency</Text>
              </View>
              <Pressable onPress={logToday} style={({ pressed }) => [styles.boost, pressed && styles.pressed]}>
                <Text style={styles.boostText}>✓</Text>
              </Pressable>
            </View>
            <View style={styles.graphHeader}>
              <Text style={styles.graphTitle}>ACTIVITY BY WEEK</Text>
              <Text style={styles.graphHint}>{completedDays.size} DAYS LOGGED</Text>
            </View>
            <View style={styles.graphWeeks}>
              {graphWeeks.map((week, weekIndex) => (
                <View key={`week-${weekIndex}`} style={styles.graphWeek}>
                  <Text style={styles.weekLabel}>W{weekIndex + 1}</Text>
                  {week.map((dateKey, dayIndex) => (
                    <Pressable key={dateKey} onPress={() => toggleDay(dateKey)} style={styles.graphCell}>
                      <View style={[styles.graphDot, dayIndex % 2 === 0 && styles.graphPink, completedDays.has(dateKey) && styles.graphCompleted]} />
                    </Pressable>
                  ))}
                  <Text style={styles.weekCount}>{week.filter((dateKey) => completedDays.has(dateKey)).length}</Text>
                </View>
              ))}
            </View>
            <View style={styles.graphLegend}>
              <Text style={styles.graphLegendText}>INACTIVE</Text>
              <View style={[styles.legendDot, styles.graphDot]} />
              <View style={[styles.legendDot, styles.graphPink]} />
              <View style={[styles.legendDot, styles.graphCompleted]} />
              <Text style={styles.graphLegendText}>COMPLETED</Text>
            </View>
          </View>
        </View>
        <View style={styles.calendarHeading}>
          <Text style={styles.sectionTitle}>Streak Calendar</Text>
          <Text style={styles.calendarYear}>{calendarYear}</Text>
        </View>
        <ScrollView ref={calendarScrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarGrid}>
          {monthNames.map((monthName, monthIndex) => {
            const firstDay = new Date(calendarYear, monthIndex, 1).getDay();
            const daysInMonth = new Date(calendarYear, monthIndex + 1, 0).getDate();
            const cells = Array.from({ length: firstDay + daysInMonth }, (_, index) => index < firstDay ? null : index - firstDay + 1);
            return (
              <View key={monthName} style={styles.monthCard}>
                <StripeHeader height={9} />
                <View style={styles.monthCardContent}>
                  <Text style={styles.monthTitle}>{monthName}</Text>
                  <View style={styles.weekRow}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <Text key={`${day}-${index}`} style={styles.weekDay}>{day}</Text>)}
                  </View>
                  <View style={styles.monthDays}>
                    {cells.map((day, index) => {
                      const dateKey = `${calendarYear}-${monthIndex}-${day}`;
                      const isCompleted = day !== null && completedDays.has(dateKey);
                      return (
                        <Pressable key={`${monthName}-${index}`} disabled={day === null} onPress={() => day !== null && toggleDay(dateKey)} style={[styles.dayCell, isCompleted && styles.completedDay]}>
                          <Text style={[styles.dayText, isCompleted && styles.completedDayText]}>{day ?? ''}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Workout Categories</Text>
            <Text style={styles.sectionSubtitle}>Personalized splits for your program</Text>
          </View>
          <Text style={styles.routineCount}>7 ROUTINES</Text>
        </View>
        {workoutSections.map((section) => (
          <Pressable
            key={section.name}
            onPress={() => setSelectedWorkout(section)}
            style={({ pressed }) => [styles.workoutCard, pressed && styles.cardPressed]}
          >
            <View style={styles.cardInfo}>
              <StripeHeader height={13} style={styles.cardInfoStripe} />
              <View style={styles.cardInfoContent}>
                <View style={[styles.categoryPill, { backgroundColor: section.color }]}>
                  <Ionicons name={section.icon as any} size={12} color="#ffffff" />
                  <Text style={styles.categoryText}>{section.category}</Text>
                </View>
                <Text style={styles.cardTitle}>{section.name.toUpperCase()}</Text>
                <Text style={styles.cardDescription}>{section.description}</Text>
                <View style={styles.cardFooterRow}>
                  <Text style={styles.cardMeta}>{section.exercises} Exercises  <Text style={styles.separator}>|</Text>  {section.minutes} Min</Text>
                  <View style={styles.viewBadge}>
                    <Text style={styles.viewBadgeText}>VIEW</Text>
                    <Ionicons name="chevron-forward" size={10} color="#ffffff" />
                  </View>
                </View>
              </View>
            </View>
            <View style={[styles.cardVisual, { backgroundColor: workoutImages[section.name] ? '#1c1c1e' : section.color }]}> 
              {workoutImages[section.name] ? (
                <>
                  <Image source={workoutImages[section.name]} style={styles.exerciseImage} />
                  <View style={styles.imageDarkOverlay} />
                </>
              ) : (
                <>
                  <View style={styles.visualShape} />
                  <Text style={styles.visualInitials}>{section.name.slice(0, 2).toUpperCase()}</Text>
                </>
              )}
              <Text style={styles.sets}>{section.sets} SETS</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Interactive Exercise Routine Modal */}
      <WorkoutModal 
        selectedWorkout={selectedWorkout}
        setSelectedWorkout={setSelectedWorkout}
        completedExercises={completedExercises}
        toggleExercise={toggleExercise}
        logToday={logToday}
      />

      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
        <ConfettiCannon 
          count={200}
          origin={{ x: Dimensions.get('window').width / 2, y: -20 }}
          autoStart={false}
          ref={confettiRef}
          fadeOut={true}
          fallSpeed={3000}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#07090e', flex: 1 },
  content: { paddingTop: 30, paddingBottom: 44 },
  header: { alignItems: 'center', borderBottomColor: '#232a38', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 13 },
  brandGroup: { alignItems: 'center', flexDirection: 'row' },
  logo: { borderRadius: 10, height: 34, marginRight: 10, width: 34 },
  brand: { color: '#f5f5f7', fontFamily: 'NotoSans_900Black', fontSize: 16, letterSpacing: 1.5 },
  brandAccent: { color: '#ff453a', fontFamily: 'NotoSans_900Black' },
  tagline: { color: '#a1a1a6', fontFamily: 'NotoSans_600SemiBold', fontSize: 8, letterSpacing: 1.1, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  actionButton: { alignItems: 'center', backgroundColor: '#1c1c1e', borderColor: '#3a3a3c', borderRadius: 18, borderWidth: 1, height: 36, justifyContent: 'center', width: 36 },
  actionText: { color: '#a1a1a6', fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.65 },
  stripeHeader: { backgroundColor: '#141518', borderBottomColor: '#282a32', borderBottomWidth: 1, overflow: 'hidden', width: '100%' },
  telemetry: { backgroundColor: '#1c1c1e', borderColor: '#3a3a3c', borderRadius: 22, borderWidth: 1, marginHorizontal: 20, marginTop: 16, minHeight: 200, overflow: 'hidden' },
  telemetryContent: { padding: 18 },
  telemetryTop: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  streakLabel: { color: '#a1a1a6', fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 5 },
  telemetryValue: { color: '#ffffff', fontSize: 30, fontWeight: '900' },
  telemetryUnit: { color: '#a1a1a6', fontSize: 11, fontWeight: '500' },
  consistency: { color: '#8e8e93', fontSize: 11, marginTop: 5 },
  boost: { alignItems: 'center', backgroundColor: '#242426', borderColor: '#3a3a3c', borderRadius: 21, borderWidth: 1, height: 42, justifyContent: 'center', width: 42 },
  boostText: { color: '#ffffff', fontSize: 20 },
  graphHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 8 },
  graphTitle: { color: '#636366', fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  graphHint: { color: '#636366', fontSize: 8, fontWeight: '600', letterSpacing: 0.8 },
  graphWeeks: { borderBottomColor: '#2c2c2e', borderBottomWidth: 1, flexDirection: 'row', paddingBottom: 8, width: '100%' },
  graphWeek: { alignItems: 'center', flexGrow: 0, flexShrink: 0, gap: 3, width: '10%' },
  weekLabel: { color: '#ffffff', fontSize: 8, fontWeight: '700', marginBottom: 1 },
  weekCount: { color: '#10e575', fontSize: 8, fontWeight: '800', marginTop: 1 },
  graphCell: { alignItems: 'center', height: 9, justifyContent: 'center', width: 20 },
  graphDot: { backgroundColor: '#2e8fe6', borderRadius: 2, height: 7, width: 14 },
  graphPink: { backgroundColor: '#bf5af2' },
  graphCompleted: { backgroundColor: '#10e575' },
  graphLegend: { alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'flex-end', marginTop: 10 },
  graphLegendText: { color: '#636366', fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  legendDot: { borderRadius: 2, height: 8, width: 12 },
  dotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginVertical: 24 },
  dotButton: { alignItems: 'center', height: 13, justifyContent: 'center', width: 13 },
  dot: { borderRadius: 2, height: 9, width: 9 },
  telemetryBottom: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  metric: { color: '#3a3a3c', fontSize: 11, fontWeight: '700' },
  metricPurple: { color: '#5e5ce6' },
  metricPink: { color: '#bf5af2' },
  metricBlue: { color: '#2e8fe6' },
  days: { color: '#636366', fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  calendarHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 24, marginBottom: 12 },
  calendarYear: { color: '#a1a1a6', fontSize: 12, fontWeight: '700' },
  calendarGrid: { gap: 10, paddingHorizontal: 20 },
  monthCard: { backgroundColor: '#1c1c1e', borderColor: '#3a3a3c', borderRadius: 16, borderWidth: 1, overflow: 'hidden', width: 158 },
  monthCardContent: { padding: 10 },
  monthTitle: { color: '#ffffff', fontSize: 13, fontWeight: '800', marginBottom: 9 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  weekDay: { color: '#ffffff', fontSize: 8, fontWeight: '700', textAlign: 'center', width: 16 },
  monthDays: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 4 },
  dayCell: { alignItems: 'center', height: 18, justifyContent: 'center', width: '14.2857%' },
  completedDay: { backgroundColor: '#10e575', borderRadius: 5 },
  dayText: { color: '#ffffff', fontSize: 9, textAlign: 'center' },
  completedDayText: { color: '#ffffff', fontWeight: '800' },
  sectionHeading: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 23, marginBottom: 12 },
  sectionTitle: { color: '#f5f5f7', fontSize: 19, fontWeight: '800' },
  sectionSubtitle: { color: '#a1a1a6', fontSize: 11, marginTop: 4 },
  routineCount: { backgroundColor: '#2c2c2e', borderColor: '#3a3a3c', borderRadius: 12, borderWidth: 1, color: '#a1a1a6', fontSize: 9, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 6 },
  workoutCard: { backgroundColor: '#1c1c1e', borderColor: '#3a3a3c', borderRadius: 22, borderWidth: 1, flexDirection: 'row', height: 155, marginHorizontal: 20, marginBottom: 13, overflow: 'hidden' },
  cardInfo: { flex: 1, overflow: 'hidden' },
  cardInfoStripe: { borderTopLeftRadius: 21 },
  cardInfoContent: { flex: 1, justifyContent: 'space-between', padding: 16, paddingTop: 12 },
  categoryPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    gap: 6,
  },
  categoryText: {
    color: '#ffffff',
    fontFamily: 'NotoSans_700Bold',
    fontSize: 10.5,
    letterSpacing: 0.2,
  },
  cardTitle: { color: '#f5f5f7', fontSize: 23, fontStyle: 'italic', fontWeight: '900', letterSpacing: 1 },
  cardDescription: { color: '#636366', fontSize: 10, marginTop: -8 },
  cardMeta: { color: '#a1a1a6', fontSize: 10, fontWeight: '600' },
  separator: { color: '#3a3a3c' },
  cardVisual: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', width: '38%' },
  exerciseImage: { height: '100%', opacity: 1, position: 'absolute', width: '100%' },
  imageDarkOverlay: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, backgroundColor: 'rgba(0, 0, 0, 0.28)' },
  visualShape: { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 80, height: 170, position: 'absolute', right: -45, width: 170 },
  visualInitials: { color: 'rgba(255,255,255,0.88)', fontSize: 35, fontWeight: '900', letterSpacing: 2 },
  sets: { backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 10, bottom: 10, color: '#ffffff', fontSize: 8, fontWeight: '800', paddingHorizontal: 7, paddingVertical: 5, position: 'absolute', right: 9 },
  cardPressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
  cardFooterRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  viewBadge: { alignItems: 'center', backgroundColor: '#2c2c2e', borderColor: '#3a3a3c', borderRadius: 8, borderWidth: 1, flexDirection: 'row', gap: 3, paddingHorizontal: 7, paddingVertical: 3 },
  viewBadgeText: { color: '#ffffff', fontFamily: 'NotoSans_700Bold', fontSize: 8, letterSpacing: 0.5 },
  modalContainer: { backgroundColor: '#07090e', flex: 1 },
  modalNavBar: { alignItems: 'center', borderBottomColor: '#232a38', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  modalCloseButton: { alignItems: 'center', backgroundColor: '#1c1c1e', borderColor: '#3a3a3c', borderRadius: 16, borderWidth: 1, height: 32, justifyContent: 'center', width: 32 },
  modalNavTitle: { color: '#f5f5f7', fontFamily: 'NotoSans_900Black', fontSize: 16, letterSpacing: 1.5 },
  modalScrollContent: { paddingBottom: 40 },
  modalHero: { backgroundColor: '#1c1c1e', borderColor: '#3a3a3c', borderRadius: 22, borderWidth: 1, marginHorizontal: 20, marginTop: 16, overflow: 'hidden' },
  modalStripe: { borderTopLeftRadius: 21, borderTopRightRadius: 21 },
  modalHeroImageContainer: { height: 180, position: 'relative', width: '100%' },
  modalHeroImage: { height: '100%', position: 'absolute', width: '100%' },
  modalHeroOverlay: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, backgroundColor: 'rgba(7, 9, 14, 0.72)' },
  modalHeroContent: { flex: 1, justifyContent: 'space-between', padding: 18, zIndex: 2 },
  modalHeroSubtitle: { fontFamily: 'NotoSans_700Bold', fontSize: 10, letterSpacing: 1.4 },
  modalHeroTitle: { color: '#ffffff', fontFamily: 'NotoSans_900Black', fontSize: 26, letterSpacing: 1 },
  modalHeroDesc: { color: '#a1a1a6', fontSize: 12, marginTop: -4 },
  modalStatsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalStatBox: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 5, paddingHorizontal: 10, paddingVertical: 6 },
  modalStatValue: { color: '#ffffff', fontFamily: 'NotoSans_600SemiBold', fontSize: 11 },
  progressCard: { backgroundColor: '#1c1c1e', borderColor: '#3a3a3c', borderRadius: 16, borderWidth: 1, marginHorizontal: 20, marginTop: 14, padding: 14 },
  progressTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: '#8e8e93', fontFamily: 'NotoSans_700Bold', fontSize: 9.5, letterSpacing: 1 },
  progressCount: { color: '#10e575', fontFamily: 'NotoSans_800ExtraBold', fontSize: 10, letterSpacing: 0.5 },
  progressBarTrack: { backgroundColor: '#2c2c2e', borderRadius: 4, height: 7, overflow: 'hidden', width: '100%' },
  progressBarFill: { borderRadius: 4, height: '100%' },
  exerciseSectionHeader: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 22, marginBottom: 12 },
  exerciseSectionTitle: { color: '#f5f5f7', fontFamily: 'NotoSans_800ExtraBold', fontSize: 18 },
  exerciseSectionHint: { color: '#8e8e93', fontSize: 11 },
  exerciseTopRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  exerciseOrderText: { color: '#8e8e93', fontFamily: 'NotoSans_800ExtraBold', fontSize: 10 },
  exerciseCardCompleted: { borderColor: '#10e57560', opacity: 0.85 },
  exerciseNameCompleted: { color: '#a1a1a6', textDecorationLine: 'line-through' },
  checkCircle: { alignItems: 'center', backgroundColor: '#242426', borderColor: '#3a3a3c', borderRadius: 12, borderWidth: 1, height: 24, justifyContent: 'center', width: 24 },
  setsBadge: { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 10, bottom: 10, paddingHorizontal: 7, paddingVertical: 5, position: 'absolute', right: 9 },
  setsBadgeCompleted: { backgroundColor: '#10e575' },
  setsBadgeText: { color: '#ffffff', fontFamily: 'NotoSans_800ExtraBold', fontSize: 8 },
  imageCompletedOverlay: { backgroundColor: 'rgba(16, 229, 117, 0.22)' },
  modalActions: { marginHorizontal: 20, marginTop: 10, marginBottom: 20 },
  primaryModalBtn: { alignItems: 'center', borderRadius: 16, flexDirection: 'row', height: 50, justifyContent: 'center', paddingHorizontal: 20 },
  primaryModalBtnText: { color: '#ffffff', fontFamily: 'NotoSans_800ExtraBold', fontSize: 14, letterSpacing: 0.5 },
  modalNewContainer: { flex: 1, backgroundColor: '#07090e' },
  modalNewScrollContent: { paddingBottom: 100 },
  modalNewHero: { height: 350, position: 'relative', width: '100%' },
  modalNewHeroImage: { height: '100%', position: 'absolute', width: '100%', top: 0, left: 0 },
  modalNewHeroGradient: { position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 },
  modalNewNavBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, zIndex: 10 },
  modalNewCloseButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalNewCategoryPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  modalNewCategoryText: { color: '#ffffff', fontFamily: 'NotoSans_800ExtraBold', fontSize: 10, letterSpacing: 0.5 },
  modalNewHeroContent: { position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 10 },
  modalNewHeroTitle: { color: '#ffffff', fontFamily: 'NotoSans_900Black', fontSize: 32, letterSpacing: 1 },
  modalNewHeroDesc: { color: '#a1a1a6', fontFamily: 'NotoSans_600SemiBold', fontSize: 13, marginTop: 4, marginBottom: 16 },
  modalNewStatsRow: { flexDirection: 'row', gap: 12 },
  modalNewStatBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flex: 1, gap: 8 },
  modalNewStatLabel: { color: '#a1a1a6', fontFamily: 'NotoSans_600SemiBold', fontSize: 9, letterSpacing: 0.5 },
  modalNewStatValue: { color: '#ffffff', fontFamily: 'NotoSans_800ExtraBold', fontSize: 13 },
  modalNewBody: { paddingHorizontal: 20, paddingTop: 10 },
  modalNewProgressContainer: { backgroundColor: '#1c1c1e', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2c2c2e' },
  modalNewProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalNewProgressTitle: { color: '#ffffff', fontFamily: 'NotoSans_800ExtraBold', fontSize: 14 },
  modalNewProgressCount: { fontFamily: 'NotoSans_900Black', fontSize: 14 },
  modalNewProgressBarBg: { backgroundColor: '#2c2c2e', height: 8, borderRadius: 4, width: '100%', overflow: 'hidden' },
  modalNewProgressBarFill: { height: '100%', borderRadius: 4 },
  modalNewListTitle: { color: '#ffffff', fontFamily: 'NotoSans_800ExtraBold', fontSize: 20, marginBottom: 16 },
  modalNewCard: { backgroundColor: '#1c1c1e', borderRadius: 16, marginBottom: 12, padding: 16, borderWidth: 1, borderColor: '#2c2c2e', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalNewCardCompleted: { borderColor: '#10e575', backgroundColor: '#10e57510' },
  modalNewCardPressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  modalNewCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1, paddingRight: 10 },
  modalNewCardIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  modalNewCardIndex: { fontFamily: 'NotoSans_900Black', fontSize: 16 },
  modalNewCardDetails: { flex: 1 },
  modalNewCardTitle: { color: '#ffffff', fontFamily: 'NotoSans_800ExtraBold', fontSize: 15, marginBottom: 4 },
  modalNewCardTitleCompleted: { color: '#10e575', textDecorationLine: 'line-through' },
  modalNewCardMeta: { color: '#a1a1a6', fontFamily: 'NotoSans_600SemiBold', fontSize: 12, marginBottom: 2 },
  modalNewCardEquip: { color: '#636366', fontFamily: 'NotoSans_700Bold', fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' },
  modalNewFabContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 40, alignItems: 'center' },
  modalNewFab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  modalNewFabText: { color: '#ffffff', fontFamily: 'NotoSans_800ExtraBold', fontSize: 16, letterSpacing: 0.5 },
  modalNewCardThumbnail: { width: 50, height: 50, borderRadius: 10 },

  /* Half-width Exercise Grid & Cards */
  modalExercisesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  modalExercisesHint: {
    color: '#8e8e93',
    fontFamily: 'NotoSans_700Bold',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  halfGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginBottom: 20,
  },
  halfWorkoutCard: {
    backgroundColor: '#1c1c1e',
    borderColor: '#3a3a3c',
    borderRadius: 18,
    borderWidth: 1,
    width: '48.2%',
    overflow: 'hidden',
  },
  halfWorkoutCardCompleted: {
    borderColor: '#10e575',
    backgroundColor: '#142018',
  },
  halfCardStripe: {
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
  },
  halfCardVisual: {
    height: 105,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#141518',
  },
  halfCardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  halfCardVisualOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  halfCardIndexBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  halfCardIndexText: {
    color: '#ffffff',
    fontFamily: 'NotoSans_800ExtraBold',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  halfCardCheckCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderColor: '#3a3a3c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halfCardCheckCircleCompleted: {
    backgroundColor: '#10e575',
    borderColor: '#10e575',
  },
  halfCardSetsBadge: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  halfCardSetsBadgeText: {
    color: '#ffffff',
    fontFamily: 'NotoSans_800ExtraBold',
    fontSize: 7.5,
  },
  halfCardContent: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 125,
  },
  halfCategoryPill: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginBottom: 6,
  },
  halfCategoryText: {
    fontFamily: 'NotoSans_700Bold',
    fontSize: 8.5,
    letterSpacing: 0.3,
  },
  halfCardTitle: {
    color: '#f5f5f7',
    fontFamily: 'NotoSans_800ExtraBold',
    fontSize: 12.5,
    letterSpacing: 0.3,
    lineHeight: 16.5,
    marginBottom: 6,
  },
  halfCardTitleCompleted: {
    color: '#10e575',
    textDecorationLine: 'line-through',
  },
  halfCardMeta: {
    color: '#a1a1a6',
    fontFamily: 'NotoSans_600SemiBold',
    fontSize: 9.5,
    marginBottom: 10,
  },
  halfCardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  halfViewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
    borderColor: '#3a3a3c',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  halfViewBadgeText: {
    color: '#ffffff',
    fontFamily: 'NotoSans_700Bold',
    fontSize: 7.5,
    letterSpacing: 0.5,
  },

  /* Full Tutorial Modal Styles */
  tutorialContainer: {
    flex: 1,
    backgroundColor: '#07090e',
  },
  tutorialNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#07090e',
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1e',
    zIndex: 10,
  },
  tutorialCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1c1c1e',
    borderWidth: 1,
    borderColor: '#3a3a3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialNavCenter: {
    alignItems: 'center',
  },
  tutorialNavHeading: {
    color: '#f5f5f7',
    fontFamily: 'NotoSans_900Black',
    fontSize: 13,
    letterSpacing: 1.2,
  },
  tutorialNavSub: {
    fontFamily: 'NotoSans_700Bold',
    fontSize: 9.5,
    letterSpacing: 0.8,
  },
  tutorialCategoryBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialScrollContent: {
    paddingBottom: 130,
  },
  tutorialHero: {
    height: 220,
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  tutorialHeroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  tutorialHeroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tutorialHeroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  tutorialEquipBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    marginBottom: 8,
  },
  tutorialEquipText: {
    fontFamily: 'NotoSans_800ExtraBold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  tutorialTitle: {
    color: '#ffffff',
    fontFamily: 'NotoSans_900Black',
    fontSize: 26,
    letterSpacing: 0.5,
    lineHeight: 32,
  },
  tutorialBody: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  tutorialSpecsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tutorialSpecCard: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    borderColor: '#2c2c2e',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 4,
  },
  tutorialSpecLabel: {
    color: '#8e8e93',
    fontFamily: 'NotoSans_700Bold',
    fontSize: 8.5,
    letterSpacing: 0.8,
  },
  tutorialSpecValue: {
    color: '#ffffff',
    fontFamily: 'NotoSans_800ExtraBold',
    fontSize: 10.5,
    textAlign: 'center',
  },
  tutorialCueBox: {
    backgroundColor: '#15171e',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  tutorialCueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tutorialCueIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tutorialCueTitle: {
    fontFamily: 'NotoSans_800ExtraBold',
    fontSize: 11,
    letterSpacing: 1,
  },
  tutorialCueText: {
    color: '#e5e5ea',
    fontFamily: 'NotoSans_600SemiBold',
    fontSize: 13,
    lineHeight: 20,
  },
  tutorialSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tutorialSectionTitle: {
    color: '#ffffff',
    fontFamily: 'NotoSans_900Black',
    fontSize: 14,
    letterSpacing: 1,
  },
  tutorialStepCount: {
    color: '#8e8e93',
    fontFamily: 'NotoSans_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  tutorialStepsList: {
    gap: 12,
  },
  tutorialStepItem: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2c2c2e',
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  tutorialStepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  tutorialStepNumberText: {
    fontFamily: 'NotoSans_900Black',
    fontSize: 12,
  },
  tutorialStepContent: {
    flex: 1,
  },
  tutorialStepLabel: {
    color: '#8e8e93',
    fontFamily: 'NotoSans_700Bold',
    fontSize: 9.5,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  tutorialStepDesc: {
    color: '#f5f5f7',
    fontFamily: 'NotoSans_400Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  tutorialBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 36,
  },
  tutorialActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  tutorialActionBtnText: {
    color: '#ffffff',
    fontFamily: 'NotoSans_800ExtraBold',
    fontSize: 14,
    letterSpacing: 0.8,
  },
});
