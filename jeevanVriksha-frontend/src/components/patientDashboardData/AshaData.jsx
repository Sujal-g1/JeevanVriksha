import React from 'react';
import { 
  Heart, Apple, AlertTriangle, Info, 
  Syringe, Droplets, Utensils, Activity, Bath, Sparkles, ShieldCheck 
} from 'lucide-react';

export const pregnancyData = [
  { 
    month: 1, title: "Month 1: शुरुआती दौर (The Beginning)",
    sections: [
      { id: "p1-s", title: "Symptoms / लक्षण", icon: <Heart className="text-red-500"/>, content: "1. Missed Period / पीरियड्स का रुकना\n2. Light Spotting / हल्की ब्लीडिंग\n3. Breast Tenderness / स्तनों में भारीपन\n4. Fatigue / बहुत थकान\n5. Frequent Urination / बार-बार पेशाब\n6. Mood Swings / मूड बदलना" },
      { id: "p1-d", title: "Diet / आहार", icon: <Apple className="text-orange-500"/>, content: "1. Spinach / पालक (Folic Acid)\n2. Whole Grains / साबुत अनाज\n3. Paneer/Soya / पनीर-सोयाबीन\n4. Fresh Fruits / ताजे फल\n5. Pulses / दालें\n6. 10 Glasses Water / 10 गिलास पानी" },
      { id: "p1-p", title: "Precautions / सावधानी", icon: <AlertTriangle className="text-yellow-600"/>, content: "1. Quit Addiction / नशा बंद करें\n2. Avoid X-ray / एक्स-रे से बचें\n3. No Heavy Lifting / भारी वजन न उठाएं\n4. Doctor Advice / डॉक्टर से सलाह\n5. No Raw Meat / कच्चा मांस न खाएं\n6. Sleep on Left / बाईं ओर सोएं" },
      { id: "p1-m", title: "Myths / मिथक", icon: <Info className="text-blue-500"/>, content: "1. Eat for Two / दो लोगों का खाना\n2. Saffron for Fair Skin / केसर से गोरा बच्चा\n3. Ghee for Delivery / घी से आसान प्रसव\n4. Belly Shape / पेट का आकार लिंग" }
    ]
  },
  { 
    month: 2, title: "Month 2: मॉर्निंग सिकनेस (Morning Sickness)",
    sections: [
      { id: "p2-s", title: "Symptoms / लक्षण", icon: <Heart className="text-red-500"/>, content: "1. Morning Nausea / सुबह उल्टी\n2. Heartburn / सीने में जलन\n3. Excessive Saliva / लार आना\n4. Food Aversion / खाने से अरुचि\n5. Bloating / पेट भारी होना\n6. Dizziness / चक्कर आना" },
      { id: "p2-d", title: "Diet / आहार", icon: <Apple className="text-orange-500"/>, content: "1. Ginger Tea / अदरक वाली चाय\n2. Dry Biscuits / सूखे बिस्कुट\n3. Yogurt / दही\n4. Lemonade / नींबू पानी\n5. Less Oil / कम तेल-मसाला\n6. Vitamin B6 / विटामिन B6" },
      { id: "p2-p", title: "Precautions / सावधानी", icon: <AlertTriangle className="text-yellow-600"/>, content: "1. No Raw Milk / कच्चा दूध न पिएं\n2. No Hot Tubs / ज्यादा गर्म पानी नहीं\n3. Limit Tea/Coffee / चाय कम करें\n4. No Stress / तनाव न लें\n5. Flat Shoes / हील्स न पहनें\n6. Avoid Long Travel / लंबी यात्रा" },
      { id: "p2-m", title: "Myths / मिथक", icon: <Info className="text-blue-500"/>, content: "1. Vomit means Girl / उल्टी मतलब लड़की\n2. Saffron Milk / केसर दूध गोरापन\n3. Bed Rest only / सिर्फ आराम करना" }
    ]
  },
  { 
    month: 3, title: "Month 3: मूड स्विंग्स (Mood Swings)",
    sections: [
      { id: "p3-s", title: "Symptoms / लक्षण", icon: <Heart className="text-red-500"/>, content: "1. Visible Veins / नीली नसें\n2. Constipation / कब्ज\n3. Belly Stretch / पेट खिंचाव\n4. Headaches / सिरदर्द\n5. Emotional Changes / मूड स्विंग्स\n6. Better Energy / ऊर्जा में सुधार" },
      { id: "p3-d", title: "Diet / आहार", icon: <Apple className="text-orange-500"/>, content: "1. High Fiber / दलिया-ओट्स\n2. Bananas / केला\n3. Broccoli / हरी सब्जियां\n4. Walnuts / अखरोट\n5. Coconut Water / नारियल पानी\n6. Iron Rich / आयरन युक्त भोजन" },
      { id: "p3-p", title: "Precautions / सावधानी", icon: <AlertTriangle className="text-yellow-600"/>, content: "1. Side Sleeping / करवट से सोएं\n2. Comfy Clothes / ढीले कपड़े\n3. Light Walk / हल्का टहलें\n4. 8hr Sleep / 8 घंटे की नींद\n5. Oral Care / दांतों की सफाई\n6. Stay Hydrated / पानी पीते रहें" },
      { id: "p3-m", title: "Myths / मिथक", icon: <Info className="text-blue-500"/>, content: "1. Heartbeat & Gender / धड़कन से लिंग\n2. Sour Cravings / खट्टा मतलब लड़का\n3. No Stairs / सीढ़ियां न चढ़ना" }
    ]
  },
  { 
    month: 4, title: "Month 4: ग्लो (The Glow)",
    sections: [
      { id: "p4-s", title: "Symptoms / लक्षण", icon: <Heart className="text-red-500"/>, content: "1. Skin Glow / चेहरे पर चमक\n2. Nosebleeds / नाक से खून\n3. Bleeding Gums / मसूड़ों में सूजन\n4. Increased Appetite / ज्यादा भूख\n5. Breathlessness / सांस फूलना\n6. Weight Gain / वजन बढ़ना" },
      { id: "p4-d", title: "Diet / आहार", icon: <Apple className="text-orange-500"/>, content: "1. Vitamin C / संतरा-नींबू\n2. Protein / दालें और टोफू\n3. Fresh Juice / ताज़ा जूस\n4. Paneer / पनीर\n5. Salad / सलाद\n6. Low Salt / कम नमक" },
      { id: "p4-p", title: "Precautions / सावधानी", icon: <AlertTriangle className="text-yellow-600"/>, content: "1. Posture / सीधा बैठें\n2. Light Yoga / हल्का योग\n3. Periodic BP / बीपी चेक कराएं\n4. Sugar Test / शुगर की जांच\n5. Regular Walk / रोज़ाना टहलें" },
      { id: "p4-m", title: "Myths / मिथक", icon: <Info className="text-blue-500"/>, content: "1. Glow means Boy / ग्लो मतलब लड़का\n2. No Travel / यात्रा बिलकुल बंद\n3. Saffron Myths / केसर की बातें" }
    ]
  },
  { 
    month: 5, title: "Month 5: हलचल (Quickening)",
    sections: [
      { id: "p5-s", title: "Symptoms / लक्षण", icon: <Heart className="text-red-500"/>, content: "1. Fetal Kick / बच्चे की किक\n2. Stretch Marks / स्ट्रेच मार्क्स\n3. Leg Cramps / पैरों में ऐंठन\n4. Backache / पीठ दर्द\n5. Intense Hunger / तेज भूख\n6. Sound Sleep / गहरी नींद" },
      { id: "p5-d", title: "Diet / आहार", icon: <Apple className="text-orange-500"/>, content: "1. Almonds / बादाम-अखरोट\n2. Turmeric Milk / हल्दी दूध\n3. Sprouts / अंकुरित अनाज\n4. Pulses / दालें\n5. Seasonal Fruit / मौसमी फल\n6. Buttermilk / छाछ" },
      { id: "p5-p", title: "Precautions / सावधानी", icon: <AlertTriangle className="text-yellow-600"/>, content: "1. Elevated Feet / पैर ऊपर रखें\n2. Belly Oil / पेट पर तेल लगाएं\n3. No Bending / ज्यादा झुकें नहीं\n4. Support Pillow / तकिया लगाएं\n5. Steady Walk / संभल कर चलें" },
      { id: "p5-m", title: "Myths / मिथक", icon: <Info className="text-blue-500"/>, content: "1. Low Belly Boy / पेट नीचे तो लड़का\n2. Drink Ghee / घी पीना जरूरी\n3. No Stretching / हाथ ऊपर न करें" }
    ]
  },
  { 
    month: 6, title: "Month 6: सूजन (Swelling)",
    sections: [
      { id: "p6-s", title: "Symptoms / लक्षण", icon: <Heart className="text-red-500"/>, content: "1. Indigestion / बदहजमी\n2. Sweat / ज्यादा पसीना\n3. Back Pain / पीठ का दर्द\n4. Swelling / हाथों-पैरों में सूजन\n5. Itchy Skin / खुजली होना\n6. Weakness / कमजोरी" },
      { id: "p6-d", title: "Diet / आहार", icon: <Apple className="text-orange-500"/>, content: "1. Oats & Dalia / ओट्स-दलिया\n2. 3L Water / 3 लीटर पानी\n3. Low Salt / कम नमक\n4. Raw Salads / सलाद\n5. Curd / दही\n6. Veg Soup / सब्जियों का सूप" },
      { id: "p6-p", title: "Precautions / सावधानी", icon: <AlertTriangle className="text-yellow-600"/>, content: "1. BP Check / बीपी चेक करें\n2. Loose Clothes / ढीले कपड़े\n3. Deep Breath / गहरी सांस\n4. Gentle Massage / हल्की मालिश\n5. Rest Periods / बीच-बीच में आराम" },
      { id: "p6-m", title: "Myths / मिथक", icon: <Info className="text-blue-500"/>, content: "1. Ghee for Delivery / घी से प्रसव\n2. No Haircut / बाल काटना मना\n3. Stay Indoors / बाहर न निकलें" }
    ]
  },
  { 
    month: 7, title: "Month 7: भारीपन (Heavy Feeling)",
    sections: [
      { id: "p7-s", title: "Symptoms / लक्षण", icon: <Heart className="text-red-500"/>, content: "1. Strong Kicks / तेज किक\n2. Vivid Dreams / साफ़ सपने\n3. Frequent Pee / बार-बार पेशाब\n4. Restlessness / बेचैनी\n5. Insomnia / नींद न आना\n6. Pelvic Pain / पेल्विक दर्द" },
      { id: "p7-d", title: "Diet / आहार", icon: <Apple className="text-orange-500"/>, content: "1. Omega-3 / अखरोट-बीज\n2. Pomegranate / अनार\n3. Chia Seeds / चिया बीज\n4. Less Spices / कम मिर्च\n5. Warm Soups / गर्म सूप\n6. Boiled Veg / उबली सब्जी" },
      { id: "p7-p", title: "Precautions / सावधानी", icon: <AlertTriangle className="text-yellow-600"/>, content: "1. Count Kicks / किक गिनें\n2. Hospital Bag / बैग तैयार करें\n3. No Travel / यात्रा न करें\n4. Blood Tests / खून की जांच\n5. Stay Calm / शांत रहें" },
      { id: "p7-m", title: "Myths / मिथक", icon: <Info className="text-blue-500"/>, content: "1. 7th Month Unlucky / 7वां महीना अशुभ\n2. Less Water / कम पानी पिएं\n3. Eclipse Scar / ग्रहण से निशान" }
    ]
  },
  { 
    month: 8, title: "Month 8: तैयारी (Preparation)",
    sections: [
      { id: "p8-s", title: "Symptoms / लक्षण", icon: <Heart className="text-red-500"/>, content: "1. Breast Leaking / स्तनों से रिसाव\n2. Pressure / पेल्विक भार\n3. Short Breath / सांस फूलना\n4. Braxton Hicks / हल्के संकुचन\n5. Lower Back Pain / कमर दर्द\n6. Fatigue / थकान" },
      { id: "p8-d", title: "Diet / आहार", icon: <Apple className="text-orange-500"/>, content: "1. Light Food / हल्का खाना\n2. Steamed Veg / भाप की सब्जी\n3. Coconut Water / नारियल पानी\n4. Khichdi / खिचड़ी\n5. Soft Fruits / नरम फल\n6. Warm Milk / गुनगुना दूध" },
      { id: "p8-p", title: "Precautions / सावधानी", icon: <AlertTriangle className="text-yellow-600"/>, content: "1. Breathing / सांस का व्यायाम\n2. Never Alone / अकेले न रहें\n3. Hospital Route / अस्पताल का रास्ता\n4. Extra Rest / ज्यादा आराम\n5. Pelvic Floor / पेल्विक एक्सरसाइज" },
      { id: "p8-m", title: "Myths / मिथक", icon: <Info className="text-blue-500"/>, content: "1. 8th Month Risk / 8वां महीना रिस्क\n2. No Massage / मालिश मना\n3. Baby Position / पेट से लिंग पहचान" }
    ]
  },
  { 
    month: 9, title: "Month 9: प्रसव (The Birth)",
    sections: [
      { id: "p9-s", title: "Symptoms / लक्षण", icon: <Heart className="text-red-500"/>, content: "1. Nesting / सफाई की इच्छा\n2. Water Break / पानी फटना\n3. Sharp Pain / तेज दर्द\n4. Contractions / संकुचन\n5. Baby Drops / बच्चा नीचे आना" },
      { id: "p9-d", title: "Diet / आहार", icon: <Apple className="text-orange-500"/>, content: "1. Bananas / केला\n2. Dates / खजूर\n3. Fresh Curd / ताज़ा दही\n4. Warm Water / गुनगुना पानी\n5. Honey / शहद\n6. Light Snacks / हल्का नाश्ता" },
      { id: "p9-p", title: "Precautions / सावधानी", icon: <AlertTriangle className="text-yellow-600"/>, content: "1. Final Bag / बैग तैयार\n2. Emergency No / नंबर पास रखें\n3. Track Pains / दर्द पहचानें\n4. Deep Breath / लंबी सांस\n5. Stay Positive / खुश रहें" },
      { id: "p9-m", title: "Myths / मिथक", icon: <Info className="text-blue-500"/>, content: "1. Castor Oil / अरंडी तेल\n2. Climbing Stairs / सीढ़ियां चढ़ना\n3. Don't Sleep / सोना मना" }
    ]
  }
];

export const babyCareDetailed = [
  {
    age: "0-3 Months (Infant / शिशु)",
    sections: [
      { id: "b1-1", title: "Breastfeeding / दूध", icon: <Droplets className="text-sky-600"/>, content: "1. Exclusive Breastmilk / सिर्फ माँ का दूध\n2. No Water / पानी न दें\n3. Feed 8-12 Times / दिन में 8-12 बार" },
      { id: "b1-2", title: "Vaccination / टीका", icon: <Syringe className="text-rose-600"/>, content: "1. Birth: BCG, OPV, Hep-B\n2. 6 Weeks: Pentavalent-1" },
      { id: "b1-3", title: "Safety & Hygiene / सफाई", icon: <Bath className="text-blue-500"/>, content: "1. Hand Wash / हाथ धोकर छुएं\n2. Cord Care / नाभि सुखा रखें" },
      { id: "b1-4", title: "Problems / समाधान", icon: <Activity className="text-orange-600"/>, content: "1. Gas / गैस - मालिश करें\n2. Spitting / दूध पलटना" }
    ]
  },
  {
    age: "3-6 Months (Growth / विकास)",
    sections: [
      { id: "b2-1", title: "Feeding / दूध", icon: <Droplets className="text-sky-600"/>, content: "1. Only Breastmilk / सिर्फ दूध\n2. No Solids / खाना अभी नहीं" },
      { id: "b2-2", title: "Vaccination / टीका", icon: <Syringe className="text-rose-600"/>, content: "1. 14 Weeks: Pentavalent-3\n2. IPV (Polio)" },
      { id: "b2-3", title: "Safety & Hygiene / सफाई", icon: <ShieldCheck className="text-green-600"/>, content: "1. Tummy Time / पेट के बल लिटाएं\n2. Clean Toys / खिलौने साफ़ करें" },
      { id: "b2-4", title: "Problems / समाधान", icon: <Activity className="text-orange-600"/>, content: "1. Teething / मसूड़ों में खुजली" }
    ]
  },
  {
    age: "6-12 Months (Starting Solids / आहार)",
    sections: [
      { id: "b3-1", title: "Diet / आहार", icon: <Utensils className="text-amber-600"/>, content: "1. Mashed Food / मसला हुआ खाना\n2. Dal-Rice / दाल-चावल" },
      { id: "b3-2", title: "Vaccination / टीका", icon: <Syringe className="text-rose-600"/>, content: "1. 9 Months: MR-1 (Measles)\n2. Vit-A / विटामिन A" },
      { id: "b3-3", title: "Safety & Hygiene / सफाई", icon: <AlertTriangle className="text-red-600"/>, content: "1. Baby Proofing / कोने ढकें" },
      { id: "b3-4", title: "Problems / समाधान", icon: <Activity className="text-orange-600"/>, content: "1. Picky Eating / खाना न खाना" }
    ]
  },
  {
    age: "1-3 Years (Toddler / बचपन)",
    sections: [
      { id: "b4-1", title: "Diet / आहार", icon: <Apple className="text-green-600"/>, content: "1. Family Pot / घर का खाना\n2. Dairy / दूध-दही-पनीर" },
      { id: "b4-2", title: "Vaccination / टीका", icon: <Syringe className="text-rose-600"/>, content: "1. 16-24M: DPT Booster" },
      { id: "b4-3", title: "Safety & Hygiene / सफाई", icon: <Droplets className="text-blue-600"/>, content: "1. Brushing / दो बार ब्रश" },
      { id: "b4-4", title: "Behavior / व्यवहार", icon: <Sparkles className="text-purple-600"/>, content: "1. Tantrums / जिद्दीपन - प्यार" }
    ]
  }
];