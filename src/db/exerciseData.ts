export interface ExerciseLibItem {
  id: string;
  name: string;
  target_muscle: string;
  equipment: string;
  instructions: string[];
  tips: string[];
}

export const EXERCISE_LIBRARY_SEED: ExerciseLibItem[] = [
  // CHEST
  {
    id: 'ex-bench-press',
    name: 'Barbell Bench Press',
    target_muscle: 'Chest',
    equipment: 'Barbell',
    instructions: [
      'Lie flat on the bench with your feet flat on the floor.',
      'Grip the barbell with hands slightly wider than shoulder-width.',
      'Unrack the bar and lower it slowly to your mid-chest.',
      'Push the bar back up explosively by driving your feet into the floor and extending your arms.'
    ],
    tips: [
      'Keep your shoulder blades retracted and pinned into the bench.',
      'Do not flare your elbows outward; keep them at a 45-degree angle.',
      'Ensure the bar does not bounce off your chest.'
    ]
  },
  {
    id: 'ex-inc-db-press',
    name: 'Incline Dumbbell Press',
    target_muscle: 'Chest',
    equipment: 'Dumbbell',
    instructions: [
      'Sit on an incline bench set to around 30 to 45 degrees.',
      'Hold a dumbbell in each hand at shoulder level with a pronated grip.',
      'Press the dumbbells straight up over your chest until your arms are fully extended.',
      'Lower the weights slowly back to the starting position.'
    ],
    tips: [
      'Control the descent to protect your rotator cuffs.',
      'Keep your feet flat on the floor for lateral stabilization.',
      'Avoid clinking the weights together at the peak.'
    ]
  },
  {
    id: 'ex-db-bench-press',
    name: 'Dumbbell Bench Press',
    target_muscle: 'Chest',
    equipment: 'Dumbbell',
    instructions: [
      'Lie flat on a bench holding a dumbbell in each hand next to your chest.',
      'Press the dumbbells straight up until your elbows lock.',
      'Lower the dumbbells slowly until they are level with your chest.'
    ],
    tips: [
      'Keep the weights balanced and follow a natural arching trajectory.',
      'Squeeze your chest at the top of the movement.'
    ]
  },
  {
    id: 'ex-inc-bb-press',
    name: 'Incline Barbell Press',
    target_muscle: 'Chest',
    equipment: 'Barbell',
    instructions: [
      'Lie on an incline bench under the barbell rack.',
      'Grip the bar slightly wider than shoulder-width.',
      'Lower the bar slowly to your upper chest.',
      'Press the bar upward until arms are locked.'
    ],
    tips: [
      'Excellent for building the upper chest (clavicular head).',
      'Keep your wrists stacked directly under the bar.'
    ]
  },
  {
    id: 'ex-cable-flyes',
    name: 'Cable Chest Flyes',
    target_muscle: 'Chest',
    equipment: 'Cables',
    instructions: [
      'Set pulleys to chest height and grab the attachments in each hand.',
      'Step forward to create tension, leaning slightly forward.',
      'With elbows slightly bent, sweep hands forward in a wide arc until they meet in front of you.',
      'Slowly return to the start position under control.'
    ],
    tips: [
      'Focus on squeezing the chest rather than pushing with your arms.',
      'Keep a constant slight bend in the elbows throughout the set.'
    ]
  },
  {
    id: 'ex-pushup',
    name: 'Push-up',
    target_muscle: 'Chest',
    equipment: 'Bodyweight',
    instructions: [
      'Start in a plank position with hands slightly wider than shoulders.',
      'Lower your chest to the floor by bending your elbows.',
      'Push through your hands to return to the starting position.'
    ],
    tips: [
      'Keep your core tight and your lower back flat (no sagging).',
      'Tuck your elbows to protect shoulder joints.'
    ]
  },
  {
    id: 'ex-chest-dips',
    name: 'Chest Dips',
    target_muscle: 'Chest',
    equipment: 'Bodyweight',
    instructions: [
      'Grab parallel bars and lift your body up.',
      'Lean slightly forward and bend your knees.',
      'Lower your body by bending your elbows until shoulders are below elbows.',
      'Push back up to the start.'
    ],
    tips: [
      'Leaning forward shifts the load from triceps to chest.',
      'Avoid going too low if you have history of shoulder pain.'
    ]
  },
  {
    id: 'ex-decline-db-press',
    name: 'Decline Dumbbell Press',
    target_muscle: 'Chest',
    equipment: 'Dumbbell',
    instructions: [
      'Secure your feet at the end of a decline bench and lie back.',
      'Hold dumbbells at chest level and press them upward.',
      'Lower under control to the sides of your chest.'
    ],
    tips: [
      'Targets the lower chest fibers.',
      'Ensure your feet are locked securely before pressing.'
    ]
  },

  // BACK
  {
    id: 'ex-deadlift',
    name: 'Barbell Deadlift',
    target_muscle: 'Back',
    equipment: 'Barbell',
    instructions: [
      'Stand with feet hip-width apart, shins close to the barbell.',
      'Bend at hips and knees, grabbing the bar with a shoulder-width grip.',
      'Flatten your spine, engage your lats, and drive through your heels to stand up.',
      'Push your hips back and lower the bar back to the floor.'
    ],
    tips: [
      'Never round your lower back under tension.',
      'Keep the bar scraping against your shins and thighs.',
      'Pull your chest up before initiating the lift.'
    ]
  },
  {
    id: 'ex-pullup',
    name: 'Pull-up',
    target_muscle: 'Back',
    equipment: 'Bodyweight',
    instructions: [
      'Hang from a pull-up bar with hands wider than shoulder-width, palms facing away.',
      'Pull your chest up toward the bar by pulling your elbows down to your ribs.',
      'Lower yourself slowly back to a dead hang.'
    ],
    tips: [
      'Do not use leg momentum (kipping) unless doing specialized training.',
      'Engage your shoulder blades before pulling.'
    ]
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Lat Pulldown',
    target_muscle: 'Back',
    equipment: 'Cables',
    instructions: [
      'Sit at a pulldown machine and adjust the knee pad.',
      'Grip the bar wider than shoulder-width and lean back slightly.',
      'Pull the bar down to your collarbones, squeezing your shoulder blades.',
      'Let the bar return slowly to the top.'
    ],
    tips: [
      'Pull with your elbows, not your hands, to target the lats.',
      'Avoid swinging your torso backward to pull the weight.'
    ]
  },
  {
    id: 'ex-bb-row',
    name: 'Bent Over Barbell Row',
    target_muscle: 'Back',
    equipment: 'Barbell',
    instructions: [
      'Hold a barbell with an overhand grip and hinge forward at the hips.',
      'Keep your back flat and pull the bar to your lower ribs.',
      'Lower the bar slowly to arms length.'
    ],
    tips: [
      'Keep your head neutral to avoid straining your neck.',
      'Avoid lifting your torso up as the weight gets heavy.'
    ]
  },
  {
    id: 'ex-db-row',
    name: 'One-Arm Dumbbell Row',
    target_muscle: 'Back',
    equipment: 'Dumbbell',
    instructions: [
      'Place one knee and same-side hand on a flat bench.',
      'Hold a dumbbell in your free hand hanging straight down.',
      'Pull the dumbbell up toward your hip, keeping the elbow tucked.',
      'Lower the weight back down slowly.'
    ],
    tips: [
      'Squeeze the lat at the top of the contraction.',
      'Do not rotate your torso; keep your shoulders parallel to the bench.'
    ]
  },
  {
    id: 'ex-cable-row',
    name: 'Seated Cable Row',
    target_muscle: 'Back',
    equipment: 'Cables',
    instructions: [
      'Sit at a cable row station with feet on platform, knees slightly bent.',
      'Grab the handle and sit upright with arms extended.',
      'Pull the handle to your abdomen, squeezing your shoulder blades together.',
      'Slowly extend your arms back to the starting point.'
    ],
    tips: [
      'Maintain a straight lower back throughout the set.',
      'Keep your shoulders down and away from your ears.'
    ]
  },
  {
    id: 'ex-tbar-row',
    name: 'T-Bar Row',
    target_muscle: 'Back',
    equipment: 'Machine',
    instructions: [
      'Position feet on the platforms and bend forward at the hips.',
      'Grip the handles and pull the bar up to your chest.',
      'Lower under control back to extension.'
    ],
    tips: [
      'Squeeze your middle back and rhomboids at the top.',
      'Keep knees bent to stabilize your lower back.'
    ]
  },
  {
    id: 'ex-hyperextension',
    name: 'Hyperextension',
    target_muscle: 'Back',
    equipment: 'Bodyweight',
    instructions: [
      'Position your thighs on the hyperextension pad.',
      'Bend forward at the waist towards the floor.',
      'Raise your upper body until your hips and spine are aligned.'
    ],
    tips: [
      'Excellent for lower back and glute strength.',
      'Do not hyperextend (arch too far back) at the top.'
    ]
  },
  {
    id: 'ex-chinup',
    name: 'Chin-up',
    target_muscle: 'Back',
    equipment: 'Bodyweight',
    instructions: [
      'Hang from a bar with palms facing towards you (underhand grip).',
      'Pull your chin over the bar.',
      'Lower slowly back to dead hang.'
    ],
    tips: [
      'Targets lats and biceps heavily.',
      'Perform slow negatives for hypertrophy.'
    ]
  },

  // SHOULDERS
  {
    id: 'ex-ohp',
    name: 'Barbell Overhead Press',
    target_muscle: 'Shoulders',
    equipment: 'Barbell',
    instructions: [
      'Set the barbell at collarbone height and grab with a shoulder-width grip.',
      'Unrack the bar, step back, and brace your core and glutes.',
      'Press the bar directly overhead, pushing your head forward as it passes.',
      'Lower the bar under control back to your upper chest.'
    ],
    tips: [
      'Do not lean back excessively to press the weight.',
      'Keep your wrists straight and forearms vertical.'
    ]
  },
  {
    id: 'ex-db-shoulder-press',
    name: 'Seated Dumbbell Shoulder Press',
    target_muscle: 'Shoulders',
    equipment: 'Dumbbell',
    instructions: [
      'Sit on a bench with vertical back support holding dumbbells at shoulder level.',
      'Press the weights straight up over your head until arms are straight.',
      'Lower the dumbbells slowly back to shoulder height.'
    ],
    tips: [
      'Keep your lower back pressed firmly into the bench pad.',
      'Stop lowering when your elbows reach a 90-degree angle to protect shoulders.'
    ]
  },
  {
    id: 'ex-lat-raise',
    name: 'Dumbbell Lateral Raise',
    target_muscle: 'Shoulders',
    equipment: 'Dumbbell',
    instructions: [
      'Stand upright holding dumbbells at your sides, leaning slightly forward.',
      'Raise the dumbbells out to your sides in a wide arc until level with shoulders.',
      'Lower the weights slowly back down.'
    ],
    tips: [
      'Lead the movement with your elbows, keeping them slightly bent.',
      'Do not swing or use momentum; control the side deltoid load.'
    ]
  },
  {
    id: 'ex-cable-lat-raise',
    name: 'Cable Lateral Raise',
    target_muscle: 'Shoulders',
    equipment: 'Cables',
    instructions: [
      'Set pulley to low and hold handle in opposite hand across body.',
      'Pull handle up and out to the side until arm is parallel to floor.',
      'Slowly return to start.'
    ],
    tips: [
      'Cables provide constant tension across the range of motion.',
      'Do not shrug; pull outwards.'
    ]
  },
  {
    id: 'ex-front-raise',
    name: 'Dumbbell Front Raise',
    target_muscle: 'Shoulders',
    equipment: 'Dumbbell',
    instructions: [
      'Stand holding dumbbells in front of your thighs.',
      'Raise one or both dumbbells straight forward to shoulder level.',
      'Lower slowly.'
    ],
    tips: [
      'Targets the anterior (front) deltoid.',
      'Keep core braced to avoid rocking.'
    ]
  },
  {
    id: 'ex-face-pull',
    name: 'Face Pull',
    target_muscle: 'Shoulders',
    equipment: 'Cables',
    instructions: [
      'Set pulley to upper chest height with rope attachment.',
      'Grip rope and step back to pull weight off stack.',
      'Pull rope towards your face, flaring elbows and pulling hands past ears.',
      'Slowly return to extension.'
    ],
    tips: [
      'Excellent for rear delts, rotator cuffs, and upper back health.',
      'Squeeze the rear delts and shoulder blades at the peak.'
    ]
  },
  {
    id: 'ex-shrug',
    name: 'Barbell Shrugs',
    target_muscle: 'Shoulders',
    equipment: 'Barbell',
    instructions: [
      'Hold a barbell with shoulder-width grip in front of your body.',
      'Raise your shoulders up towards your ears.',
      'Hold for a second, then lower under control.'
    ],
    tips: [
      'Do not roll your shoulders; move them straight up and down.',
      'Engages upper trapezius muscles.'
    ]
  },
  {
    id: 'ex-arnold-press',
    name: 'Arnold Press',
    target_muscle: 'Shoulders',
    equipment: 'Dumbbell',
    instructions: [
      'Sit holding dumbbells at shoulder level with palms facing you.',
      'Press dumbbells up while rotating wrists so palms face forward at top.',
      'Reverse rotation on descent.'
    ],
    tips: [
      'Engages multiple heads of the deltoids.',
      'Perform the rotation smoothly.'
    ]
  },

  // LEGS
  {
    id: 'ex-squat',
    name: 'Barbell Squat',
    target_muscle: 'Legs',
    equipment: 'Barbell',
    instructions: [
      'Place barbell on upper traps, grip bar, and unrack.',
      'Step back, place feet shoulder-width apart, toes flared slightly.',
      'Hinge hips and bend knees to lower body until thighs are parallel to floor.',
      'Drive through heels and stand back up.'
    ],
    tips: [
      'Keep your chest high and lower back braced throughout the movement.',
      'Ensure knees push outward and do not cave inward.'
    ]
  },
  {
    id: 'ex-leg-press',
    name: 'Leg Press',
    target_muscle: 'Legs',
    equipment: 'Machine',
    instructions: [
      'Sit in leg press carriage, feet shoulder-width on platform.',
      'Unlock safety bars and lower platform until knees are bent at 90 degrees.',
      'Push platform back up without locking your knees.'
    ],
    tips: [
      'Never lock your knees at the top under heavy loads.',
      'Keep your butt flat on the seat pad.'
    ]
  },
  {
    id: 'ex-rdl',
    name: 'Romanian Deadlift',
    target_muscle: 'Legs',
    equipment: 'Barbell',
    instructions: [
      'Hold a barbell at hips. Stand with knees slightly bent.',
      'Push hips backward, hinging forward, lowering bar down shins.',
      'Feel stretch in hamstrings, drive hips forward to stand up.'
    ],
    tips: [
      'Maintain a flat back and neutral neck.',
      'The movement is horizontal (hips moving back) not vertical.'
    ]
  },
  {
    id: 'ex-leg-curl',
    name: 'Lying Leg Curl',
    target_muscle: 'Legs',
    equipment: 'Machine',
    instructions: [
      'Lie face down on leg curl machine, rollers against lower calves.',
      'Pull rollers up towards your glutes, squeezing hamstrings.',
      'Lower weights slowly.'
    ],
    tips: [
      'Do not let your hips lift off the pad.',
      'Maintain ankle flexion during rep.'
    ]
  },
  {
    id: 'ex-leg-extension',
    name: 'Leg Extension',
    target_muscle: 'Legs',
    equipment: 'Machine',
    instructions: [
      'Sit on extension machine, rollers against lower shins.',
      'Extend legs forward until straight, squeezing quads.',
      'Lower slowly.'
    ],
    tips: [
      'Good for quadriceps isolation.',
      'Do not swing or kick the weight.'
    ]
  },
  {
    id: 'ex-lunges',
    name: 'Dumbbell Lunges',
    target_muscle: 'Legs',
    equipment: 'Dumbbell',
    instructions: [
      'Stand holding dumbbells, step one foot forward.',
      'Lower body until front thigh is parallel, back knee near floor.',
      'Push off front foot and return to stand.'
    ],
    tips: [
      'Keep torso upright.',
      'Ensure front knee stays aligned with toes.'
    ]
  },
  {
    id: 'ex-bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    target_muscle: 'Legs',
    equipment: 'Dumbbell',
    instructions: [
      'Place one foot behind you on a bench, hold dumbbells.',
      'Lower hips until front thigh is parallel.',
      'Drive back up using front leg.'
    ],
    tips: [
      'Excellent for quad and glute strength and correcting imbalances.',
      'Maintain balance before lowering.'
    ]
  },
  {
    id: 'ex-calf-raise',
    name: 'Calf Raise',
    target_muscle: 'Legs',
    equipment: 'Bodyweight',
    instructions: [
      'Stand on edge of block, lower heels down.',
      'Press through toes, raising body up.',
      'Lower under control.'
    ],
    tips: [
      'Hold the stretch at the bottom for a second.',
      'Squeeze the calves at the top.'
    ]
  },

  // ARMS
  {
    id: 'ex-bb-curl',
    name: 'Barbell Bicep Curl',
    target_muscle: 'Arms',
    equipment: 'Barbell',
    instructions: [
      'Stand holding barbell with underhand grip.',
      'Keep elbows tucked and curl bar to shoulder level.',
      'Lower bar slowly.'
    ],
    tips: [
      'Avoid swinging torso to lift bar.',
      'Control the eccentric (lowering) phase.'
    ]
  },
  {
    id: 'ex-db-curl',
    name: 'Alternating Dumbbell Curl',
    target_muscle: 'Arms',
    equipment: 'Dumbbell',
    instructions: [
      'Stand holding dumbbells. Curl one weight up, rotating wrist up.',
      'Lower under control and repeat on opposite side.'
    ],
    tips: [
      'Focus on bicep supination (wrist turn) at the peak.'
    ]
  },
  {
    id: 'ex-hammer-curl',
    name: 'Hammer Curl',
    target_muscle: 'Arms',
    equipment: 'Dumbbell',
    instructions: [
      'Stand holding dumbbells with neutral grip (palms face each other).',
      'Curl dumbbells up without rotating wrists.',
      'Lower slowly.'
    ],
    tips: [
      'Targets the brachialis and brachioradialis (forearm).'
    ]
  },
  {
    id: 'ex-preacher-curl',
    name: 'Preacher Curl',
    target_muscle: 'Arms',
    equipment: 'Barbell',
    instructions: [
      'Sit at preacher bench, arms flat on pad holding barbell.',
      'Curl the barbell up towards chin.',
      'Lower slowly to near full extension.'
    ],
    tips: [
      'Prevents cheating by isolating biceps completely.',
      'Do not over-extend elbows at bottom.'
    ]
  },
  {
    id: 'ex-tri-pushdown',
    name: 'Tricep Pushdown',
    target_muscle: 'Arms',
    equipment: 'Cables',
    instructions: [
      'Stand at cable pulley with rope or bar.',
      'Tuck elbows at sides and push bar down to thighs.',
      'Let pulley return to chest level, keeping elbows locked in place.'
    ],
    tips: [
      'Keep upper arms stationary; move only forearms.'
    ]
  },
  {
    id: 'ex-skull-crusher',
    name: 'Skull Crusher',
    target_muscle: 'Arms',
    equipment: 'Barbell',
    instructions: [
      'Lie on flat bench holding barbell straight up.',
      'Lower bar by bending elbows towards forehead.',
      'Press bar back up to start.'
    ],
    tips: [
      'Keep elbows pointing forward, do not let them flare.'
    ]
  },
  {
    id: 'ex-overhead-tri-ext',
    name: 'Overhead Tricep Extension',
    target_muscle: 'Arms',
    equipment: 'Dumbbell',
    instructions: [
      'Hold dumbbell overhead with both hands, elbows pointing forward.',
      'Lower dumbbell behind head, bending elbows.',
      'Press dumbbell back up.'
    ],
    tips: [
      'Targets the long head of the triceps.'
    ]
  },
  {
    id: 'ex-close-grip-bench',
    name: 'Close-Grip Bench Press',
    target_muscle: 'Arms',
    equipment: 'Barbell',
    instructions: [
      'Lie flat on bench, grip bar at shoulder-width or slightly narrower.',
      'Lower bar to mid-chest, keeping elbows tucked close to torso.',
      'Press up to lock.'
    ],
    tips: [
      'Tucking elbows shifts load heavily to triceps.'
    ]
  },

  // CORE
  {
    id: 'ex-crunch',
    name: 'Abdominal Crunch',
    target_muscle: 'Core',
    equipment: 'Bodyweight',
    instructions: [
      'Lie on back with knees bent, feet flat.',
      'Place hands behind head and lift shoulders off floor, squeezing abs.',
      'Lower slowly.'
    ],
    tips: [
      'Do not pull on your neck with hands.'
    ]
  },
  {
    id: 'ex-leg-raise',
    name: 'Hanging Leg Raise',
    target_muscle: 'Core',
    equipment: 'Bodyweight',
    instructions: [
      'Hang from bar. Keep legs straight and raise them to parallel.',
      'Lower slowly under control.'
    ],
    tips: [
      'Avoid swinging body. Raise hips, not just thighs.'
    ]
  },
  {
    id: 'ex-plank',
    name: 'Plank',
    target_muscle: 'Core',
    equipment: 'Bodyweight',
    instructions: [
      'Hold push-up position resting on forearms instead of hands.',
      'Keep body in straight line, bracing core.'
    ],
    tips: [
      'Do not let hips sag or rise too high.'
    ]
  },
  {
    id: 'ex-russian-twist',
    name: 'Russian Twist',
    target_muscle: 'Core',
    equipment: 'Bodyweight',
    instructions: [
      'Sit with knees bent, lift feet slightly, lean back.',
      'Rotate torso side to side, touching hands to floor.'
    ],
    tips: [
      'Targets obliques. Can hold dumbbell for difficulty.'
    ]
  },
  {
    id: 'ex-cable-crunch',
    name: 'Cable Crunch',
    target_muscle: 'Core',
    equipment: 'Cables',
    instructions: [
      'Kneel below high pulley with rope. Place rope behind neck.',
      'Crunch downward, drawing elbows to thighs.',
      'Return slowly.'
    ],
    tips: [
      'Flex through spine, do not sit down at hips.'
    ]
  },
  {
    id: 'ex-ab-wheel',
    name: 'Ab Wheel Rollout',
    target_muscle: 'Core',
    equipment: 'Bodyweight',
    instructions: [
      'Kneel and hold ab wheel handles.',
      'Roll wheel forward, extending body.',
      'Pull wheel back under hips.'
    ],
    tips: [
      'Maintain slight spinal flexion (posterior tilt) to protect lower back.'
    ]
  }
];
