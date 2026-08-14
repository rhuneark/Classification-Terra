import type { Item, Rarity, LocationDanger, EquipSlot } from './types.ts';

// ── helpers ────────────────────────────────────────────────────────────────
type IT = Item['type'];
type ST = Item['special'];
function itm(id:string,name:string,desc:string,rarity:Rarity,type:IT,power:number,damage:number,defense:number,special:ST,sellValue:number,extra?:Partial<Item>):Item{
    return{id,name,description:desc,rarity,type,power,damage,defense,special,sellValue,...extra};
}

// ── COMMON ─────────────────────────────────────────────────────────────────
const COMMON: Item[] = [
    // Weapons → hand
    itm('bent-fork','Bent Fork',"Three out of four tines. Somehow worse than useless.",'common','weapon',5,3,0,[],2,{equipSlot:'hand' as EquipSlot}),
    itm('rusty-penknife','Rusty Penknife',"Doesn't fold all the way. Blade opens fine, though.",'common','weapon',8,6,0,[],3,{equipSlot:'hand' as EquipSlot}),
    itm('sharpened-stick','Sharpened Stick',"You took your time with this one. It shows.",'common','weapon',6,4,0,[],2,{equipSlot:'hand' as EquipSlot}),
    itm('broken-bottle','Broken Bottle',"The contents are gone. At least it's sharp now.",'common','weapon',7,5,0,[],2,{equipSlot:'hand' as EquipSlot}),
    itm('cracked-brick','Cracked Brick',"Heavy end goes toward enemy. You figured this out yourself.",'common','weapon',9,7,0,[],3,{equipSlot:'hand' as EquipSlot}),
    itm('rusty-nail-punch','Nail Puncher',"Two nails through a block of wood. Artisanal.",'common','weapon',10,8,0,[],4,{equipSlot:'hand' as EquipSlot}),
    itm('metal-shard','Torn Metal Shard',"Sharp enough. Handle situation carefully.",'common','weapon',6,4,0,[],2,{equipSlot:'hand' as EquipSlot}),
    itm('chair-leg','Repurposed Chair Leg',"Still has the bolt hole. Character.",'common','weapon',8,6,0,[],3,{equipSlot:'hand' as EquipSlot}),
    itm('rope-flail','Knotted Rope Flail',"Effective in theory. Effective in practice once you practiced.",'common','weapon',7,5,0,[],3,{equipSlot:'hand' as EquipSlot}),
    itm('slingshot','Improvised Slingshot',"Reliable up to 12 feet. Beyond that, good luck.",'common','weapon',5,4,0,[],2,{equipSlot:'hand' as EquipSlot}),
    itm('half-scissors','Half a Scissors',"The other half is out there. Try not to think about it.",'common','weapon',6,5,0,[],2,{equipSlot:'hand' as EquipSlot}),
    itm('duct-taped-club','Duct-Taped Club',"The tape is structural.",'common','weapon',12,9,0,[],4,{equipSlot:'hand' as EquipSlot}),
    // Armor → various slots
    itm('torn-hazmat-glove','Torn Hazmat Glove (L)',"Left hand only. Right hand remains unprotected and aware of this.",'common','armor',4,0,4,[],2,{equipSlot:'hand' as EquipSlot}),
    itm('cracked-face-shield','Cracked Face Shield',"The crack is on your side. You'll adjust.",'common','armor',5,0,5,[],2,{equipSlot:'head' as EquipSlot}),
    itm('damp-bandana','Damp Bandana',"Filters nothing. Absorbs everything.",'common','armor',3,0,3,[],1,{equipSlot:'head' as EquipSlot}),
    itm('waterlogged-boot','Waterlogged Boot (one)',"Keeps the right foot dry. Left foot philosophical.",'common','armor',3,0,3,[],1,{equipSlot:'feet' as EquipSlot}),
    itm('cardboard-chest','Cardboard Chest Piece',"Rated for light rain. That's it.",'common','armor',5,0,5,[],2,{equipSlot:'torso' as EquipSlot}),
    itm('newspaper-padding','Wrapped Newspaper Padding',"Informative AND protective. Neither very well.",'common','armor',4,0,4,[],1,{equipSlot:'torso' as EquipSlot}),
    itm('cracked-hard-hat','Hard Hat (cracked)',"The crack is cosmetic. You've decided this.",'common','armor',6,0,6,[],3,{equipSlot:'head' as EquipSlot}),
    itm('one-knee-pad','Knee Pad (one)',"The right knee is the important one.",'common','armor',3,0,3,[],1,{equipSlot:'legs' as EquipSlot}),
    itm('torn-raincoat','Torn Raincoat',"Stays on. That's the one thing it does.",'common','armor',5,0,5,[],2,{equipSlot:'torso' as EquipSlot}),
    itm('plastic-shoulder','Plastic Shoulder Guard',"Repurposed from sporting goods. Still has the logo.",'common','armor',5,0,5,[],2,{equipSlot:'torso' as EquipSlot}),
    itm('leather-vest','Leather Vest',"Cracked in the back. Holds form up front.",'common','armor',8,0,8,[],3,{equipSlot:'torso' as EquipSlot}),
    // Utility → hand
    itm('antibiotic-strip','Expired Antibiotic Strip',"Three years past. You've had worse odds.",'common','utility',2,0,2,[],1,{equipSlot:'hand' as EquipSlot}),
    itm('tin-can','Crumpled Tin Can',"Good for throwing. Better for denting skulls.",'common','utility',3,1,0,[],1,{equipSlot:'hand' as EquipSlot}),
    itm('shoelace','Scavenged Shoelace',"Holds things together. Metaphorically too.",'common','utility',1,0,1,[],1,{equipSlot:'hand' as EquipSlot}),
    itm('broken-compass','Pocket Compass (broken)',"North is somewhere to your left. Probably.",'common','utility',2,0,1,[],1,{equipSlot:'hand' as EquipSlot}),
    itm('spent-lighter','Spent Lighter',"Sparks occasionally. Keeps people guessing.",'common','utility',2,1,0,[],1,{equipSlot:'hand' as EquipSlot}),
    itm('water-manual','Water-Damaged Manual',"Most of it survived. The important parts, unclear.",'common','utility',3,0,2,[],1,{equipSlot:'hand' as EquipSlot}),
    itm('flat-battery','Flat Phone Battery',"Useless as power source. Excellent as shim.",'common','utility',1,0,1,[],1,{equipSlot:'hand' as EquipSlot}),
    itm('corroded-keys','Corroded Keys (no lock)',"You keep them. You don't know why.",'common','utility',2,0,1,[],1,{equipSlot:'hand' as EquipSlot}),
];

// ── UNCOMMON ──────────────────────────────────────────────────────────────
const UNCOMMON: Item[] = [
    // Weapons → hand
    itm('spore-canister','Fungal Spore Canister',"Don't inhale. Actually, do. It affects your opponents more.",'uncommon','weapon',20,15,0,['bio','aoe'],8,{equipSlot:'hand' as EquipSlot}),
    itm('crowbar','Salvaged Crowbar',"Multi-use. Last use was combat. First use was also combat.",'uncommon','weapon',22,18,0,[],9,{equipSlot:'hand' as EquipSlot}),
    itm('glass-shiv','Glass Shiv',"Wrapped handle. Exposed blade. Functional.",'uncommon','weapon',18,15,0,[],7,{equipSlot:'hand' as EquipSlot}),
    itm('steel-pipe','Steel Pipe (reinforced)',"Heavier than it looks. Looks heavy.",'uncommon','weapon',26,20,0,[],10,{equipSlot:'hand' as EquipSlot}),
    itm('nail-bat','Nail Bat',"Forty-two nails. Counted.",'uncommon','weapon',28,22,0,[],11,{equipSlot:'hand' as EquipSlot}),
    itm('hunting-knife','Hunting Knife (field-sharpened)',"Found it. Sharpened it. Use it.",'uncommon','weapon',23,19,0,[],9,{equipSlot:'hand' as EquipSlot}),
    itm('chain-whip','Chain Whip (improvised)',"Reach advantage. Coordination required.",'uncommon','weapon',21,16,0,[],8,{equipSlot:'hand' as EquipSlot}),
    itm('sharpened-rebar','Sharpened Rebar',"Industrial-grade blunt. Field-modified sharp.",'uncommon','weapon',19,15,0,[],8,{equipSlot:'hand' as EquipSlot}),
    itm('impact-wrench','Impact Wrench (battery dead)',"Still swings like it's working.",'uncommon','weapon',24,19,0,[],9,{equipSlot:'hand' as EquipSlot}),
    itm('taser','Jury-Rigged Taser',"Voltage uncertain. Results consistent.",'uncommon','weapon',22,17,0,['stun'],10,{equipSlot:'hand' as EquipSlot}),
    itm('bone-baton','Bone Baton',"Femur. Human. Nobody asks.",'uncommon','weapon',20,15,0,[],8,{equipSlot:'hand' as EquipSlot}),
    itm('lead-sap','Weighted Sap (lead)',"Small. Dense. Persuasive.",'uncommon','weapon',19,15,0,[],8,{equipSlot:'hand' as EquipSlot}),
    // Armor → various slots
    itm('patched-vest','Patched Leather Vest',"Six patches. Two load-bearing.",'uncommon','armor',17,0,17,['bio'],7,{equipSlot:'torso' as EquipSlot}),
    itm('work-gloves','Work Gloves (pair)',"Finally. Both hands covered.",'uncommon','armor',16,0,16,[],6,{equipSlot:'hand' as EquipSlot}),
    itm('hazmat-boots','Hazmat Boots (too big)',"Extra socks handle the fit. Contamination handled by boots.",'uncommon','armor',19,0,19,['hazmat'],8,{equipSlot:'feet' as EquipSlot}),
    itm('filtered-resp','Filtered Respirator (partial)',"One filter remaining. Make it count.",'uncommon','armor',18,0,18,['hazmat'],8,{equipSlot:'head' as EquipSlot}),
    itm('industrial-poncho','Rain Poncho (industrial)',"Industrial-grade. Weighs more than it should.",'uncommon','armor',17,0,17,[],7,{equipSlot:'torso' as EquipSlot}),
    itm('tactical-boots','Tactical Boots (size 11)',"Not your size. Your size anyway.",'uncommon','armor',19,0,19,[],8,{equipSlot:'feet' as EquipSlot}),
    itm('welding-mask','Welding Mask (scratched lens)',"Visibility 60%. Protection 100%. Tradeoff.",'uncommon','armor',21,0,21,['hazmat'],9,{equipSlot:'head' as EquipSlot}),
    itm('chain-mail-frag','Chain Mail Fragment',"Pre-collapse. Somebody was prepared.",'uncommon','armor',24,0,24,[],10,{equipSlot:'torso' as EquipSlot}),
    itm('trauma-plate','Trauma Plate (single)',"One plate. Put it where it counts.",'uncommon','armor',20,0,20,[],8,{equipSlot:'torso' as EquipSlot}),
    itm('military-cap','Military Cap',"Rank insignia removed. Better that way.",'uncommon','armor',15,0,15,[],6,{equipSlot:'head' as EquipSlot}),
    // Utility → hand
    itm('antiseptic-spray','Antiseptic Spray (half)',"50% capacity. Better than 0%.",'uncommon','utility',12,0,8,[],5,{equipSlot:'hand' as EquipSlot}),
    itm('quarantine-badge','Quarantine Badge (expired)',"They stopped checking expiry dates. Useful again.",'uncommon','utility',10,0,7,[],5,{equipSlot:'hand' as EquipSlot}),
    itm('rope-5m','Scavenged Rope (5m)',"Load-rated to 200lbs. You weigh 170. Fine.",'uncommon','utility',11,0,7,[],5,{equipSlot:'hand' as EquipSlot}),
    itm('motion-detect','Motion Detector (damaged)',"Triggers on motion. Also on stillness. Occasionally neither.",'uncommon','utility',14,0,8,[],6,{equipSlot:'hand' as EquipSlot}),
    itm('lockpick-set','Lockpick Set (incomplete)',"Eight picks, missing the tension wrench. Improvise.",'uncommon','utility',13,0,7,[],6,{equipSlot:'hand' as EquipSlot}),
    itm('field-binos','Field Binoculars (foggy lens)',"Doubles your effective scouting range. Halves your clarity.",'uncommon','utility',14,0,9,['nav'],6,{equipSlot:'hand' as EquipSlot}),
    itm('signal-flare','Signal Flare (one)',"Single use. Make it matter.",'uncommon','utility',12,0,8,[],5,{equipSlot:'hand' as EquipSlot}),
    itm('purif-tabs','Water Purification Tablets',"One pack. Eight tabs. Sixteen days clean.",'uncommon','utility',11,0,7,[],5,{equipSlot:'hand' as EquipSlot}),
];

// ── RARE ──────────────────────────────────────────────────────────────────
const RARE: Item[] = [
    // Weapons → hand
    itm('mycelium-blade','Mycelium Blade',"The edge isn't metal. It's growth.",'rare','weapon',38,28,0,['bio','bleed'],16,{equipSlot:'hand' as EquipSlot}),
    itm('spore-grenade','Spore Cloud Grenade',"Disperses over a 10m radius. Aerosolized regret.",'rare','weapon',42,30,0,['bio','aoe'],18,{equipSlot:'hand' as EquipSlot}),
    itm('scalpel-set','Scalpel Set (intact)',"Medical-grade. Repurposed.",'rare','weapon',35,27,0,[],15,{equipSlot:'hand' as EquipSlot}),
    itm('military-knife','Military Knife (classified issue)',"Issued once. Never returned.",'rare','weapon',38,29,0,[],16,{equipSlot:'hand' as EquipSlot}),
    itm('field-machete','Field Machete (survival grade)',"Rated for jungle. Adequate for this.",'rare','weapon',45,34,0,[],19,{equipSlot:'hand' as EquipSlot}),
    itm('shotgun-jammed','Combat Shotgun (jammed, 2 shells)',"Two rounds. Unjam it and you have two rounds.",'rare','weapon',37,28,0,[],16,{equipSlot:'hand' as EquipSlot}),
    itm('dart-set','Fungal Toxin Dart Set',"Twelve darts. Paralytic fungal extract. Track your dosage.",'rare','weapon',41,30,0,['bio','bleed'],18,{equipSlot:'hand' as EquipSlot}),
    itm('explosive-compound','Explosive Compound (unstable)',"Unstable. You've been careful so far.",'rare','weapon',40,30,0,['aoe'],17,{equipSlot:'hand' as EquipSlot}),
    itm('emp-device','EMP Pulse Device (single use)',"One use. Makes everything in range briefly not work. Including you.",'rare','weapon',36,26,0,['stun'],15,{equipSlot:'hand' as EquipSlot}),
    itm('nail-driver','Pneumatic Nail Driver',"Still pressurized. 8000 PSI of argument.",'rare','weapon',39,29,0,[],16,{equipSlot:'hand' as EquipSlot}),
    // Armor → various slots
    itm('cdc-jacket','CDC Field Jacket',"PROPERTY OF CDC. They're not coming for it.",'rare','armor',39,0,39,['hazmat','bio'],17,{equipSlot:'protection' as EquipSlot}),
    itm('contam-suit-part','Contamination Suit (partial)',"Partial. Better than theoretical.",'rare','armor',43,0,43,['hazmat'],18,{equipSlot:'protection' as EquipSlot}),
    itm('lab-face-shield','Lab-Grade Face Shield',"Impact and splash rated. Actually lab-grade.",'rare','armor',36,0,36,[],15,{equipSlot:'head' as EquipSlot}),
    itm('ballistic-vest','Ballistic Vest (worn)',"Light trauma protection. No rifle rounds.",'rare','armor',39,0,39,[],16,{equipSlot:'torso' as EquipSlot}),
    itm('military-helmet','Military Helmet (gen 2)',"Gen 2. Gen 3 exists. Gen 3 is gone.",'rare','armor',36,0,36,[],15,{equipSlot:'head' as EquipSlot}),
    itm('nbc-partial','NBC Suit (partial, sealed)',"Nuclear/bio/chem. Two of three functions intact.",'rare','armor',43,0,43,['hazmat'],18,{equipSlot:'protection' as EquipSlot}),
    itm('knee-plates','Impact-Resistant Kneepads',"Both knees. Both covered. Thank you.",'rare','armor',33,0,33,[],14,{equipSlot:'legs' as EquipSlot}),
    itm('ceramic-plate','Ceramic Body Armor Plate',"Single plate. Position it wisely.",'rare','armor',37,0,37,[],16,{equipSlot:'torso' as EquipSlot}),
    // Utility → hand
    itm('specimen-jar','Infected Specimen Jar',"The seal holds. Mostly.",'rare','utility',26,0,16,['bio'],11,{equipSlot:'hand' as EquipSlot}),
    itm('outbreak-map','Outbreak Map (general)',"Coverage: regional. Accuracy: approximate.",'rare','utility',24,0,14,['nav'],10,{equipSlot:'hand' as EquipSlot}),
    itm('medical-toolkit','Medical Toolkit (incomplete)',"Missing the sutures and the optimism. Has everything else.",'rare','utility',28,0,18,[],12,{equipSlot:'hand' as EquipSlot}),
    itm('geiger-counter','Field Geiger Counter',"Clicks occasionally. You've accepted this.",'rare','utility',22,0,14,[],10,{equipSlot:'hand' as EquipSlot}),
    itm('encrypted-radio','Encrypted Radio',"Encrypted. Also broken. Nobody can hear you either way.",'rare','utility',26,0,16,[],11,{equipSlot:'hand' as EquipSlot}),
    itm('portable-lab','Portable Lab Kit',"Fits in a case. Results in 20 minutes. Doesn't lie.",'rare','utility',30,0,18,['bio'],12,{equipSlot:'hand' as EquipSlot}),
];

// ── EPIC ──────────────────────────────────────────────────────────────────
const EPIC: Item[] = [
    // Weapons → hand
    itm('bone-saw','Pneumatic Bone Saw',"Charged. The teeth are recent.",'epic','weapon',68,50,0,[],28,{equipSlot:'hand' as EquipSlot}),
    itm('qe-baton','Quarantine Enforcer Baton',"Property of the enforcement division. The division is gone.",'epic','weapon',72,53,0,['stun'],30,{equipSlot:'hand' as EquipSlot}),
    itm('plasma-cutter','Plasma Cutter (salvaged)',"Industrial torch. 4500 degrees. Combat-applicable.",'epic','weapon',67,49,0,[],28,{equipSlot:'hand' as EquipSlot}),
    itm('chem-sprayer','Chemical Sprayer (military)',"Delivery system for three different bad days.",'epic','weapon',62,46,0,['bio','aoe','hazmat'],26,{equipSlot:'hand' as EquipSlot}),
    itm('concussion-grenade','Concussion Grenade (live)',"Live. Meaning active. Meaning be careful.",'epic','weapon',58,43,0,['aoe','stun'],25,{equipSlot:'hand' as EquipSlot}),
    itm('classified-sidearm','Classified Sidearm (no ammo)',"Black project. No serial. No ammo. Still terrifying somehow.",'epic','weapon',65,48,0,[],27,{equipSlot:'hand' as EquipSlot}),
    itm('bioagent-canister','Experimental Bioagent Canister',"Classified contents. Immediate effect.",'epic','weapon',70,52,0,['bio','aoe'],29,{equipSlot:'hand' as EquipSlot}),
    itm('spike-driver','Industrial Spike Driver',"Railway equipment. One spike, one strike.",'epic','weapon',64,47,0,[],27,{equipSlot:'hand' as EquipSlot}),
    // Armor → various slots
    itm('full-hazmat','Full Hazmat Suit (minor breach)',"The breach is on the left shoulder. Your call.",'epic','armor',82,0,82,['hazmat','bio'],34,{equipSlot:'protection' as EquipSlot}),
    itm('mycelium-shell','Mycelium Armor Shell',"It grew around you. You let it.",'epic','armor',88,0,88,['bio','growth'],36,{equipSlot:'protection' as EquipSlot}),
    itm('exo-frame','Experimental Exo-Frame (damaged)',"Military prototype. Servo on left arm sticks occasionally.",'epic','armor',75,0,75,[],32,{equipSlot:'protection' as EquipSlot}),
    itm('nbc-complete','NBC Suit (complete, aging seals)',"Complete. Seals at 72%. Adjust expectations.",'epic','armor',71,0,71,['hazmat'],30,{equipSlot:'protection' as EquipSlot}),
    itm('tactical-shield','Tactical Shield (cracked)',"Crack is horizontal. Ballistics still deflect.",'epic','armor',64,0,64,[],27,{equipSlot:'hand' as EquipSlot}),
    itm('adaptive-camo','Adaptive Camouflage Vest',"Thermal disruptive patterning. Nobody sees you until they do.",'epic','armor',70,0,70,[],29,{equipSlot:'torso' as EquipSlot}),
    itm('rad-suit-partial','Radiation Shielding Suit (70%)',"Provides 70% coverage. That 30% gap is on you.",'epic','armor',68,0,68,['hazmat'],29,{equipSlot:'protection' as EquipSlot}),
    // Utility → hand
    itm('sector7-map','Outbreak Map (Sector 7)',"Sector 7 was the epicenter. This map predates the cover-up.",'epic','utility',48,0,30,['nav','bio'],20,{equipSlot:'hand' as EquipSlot}),
    itm('symbiont-brace','Fungal Symbiont Brace',"It's alive. It's yours now. Mutually.",'epic','utility',52,0,34,['bio','growth'],22,{equipSlot:'hand' as EquipSlot}),
    itm('field-med-kit','Enhanced Field Medical Kit',"Field trauma, surgical repair, blood-typing. One bag.",'epic','utility',46,0,28,[],19,{equipSlot:'hand' as EquipSlot}),
    itm('tactical-drone','Tactical Drone (damaged)',"One working rotor. Still gathers intel. Loudly.",'epic','utility',50,0,30,['nav'],21,{equipSlot:'hand' as EquipSlot}),
    itm('classified-file','Classified Intelligence File',"Redacted heavily. What isn't redacted is worse.",'epic','utility',44,0,28,[],19,{equipSlot:'hand' as EquipSlot}),
    itm('neural-fragment','Neural Interface Fragment',"Pre-collapse tech. Interfaces with something. Unclear what.",'epic','utility',48,0,30,[],20,{equipSlot:'hand' as EquipSlot}),
];

// ── LEGENDARY ─────────────────────────────────────────────────────────────
const LEGENDARY: Item[] = [
    // Weapons → hand
    itm('outbreak-zero','Outbreak Zero Sample',"The original. Sealed. Don't break it. Don't break it.",'legendary','weapon',128,92,0,['bio','aoe'],52,{equipSlot:'hand' as EquipSlot}),
    itm('surgical-laser','Surgical Laser (portable)',"Calibrated for soft tissue. Effective on other tissue.",'legendary','weapon',135,98,0,[],55,{equipSlot:'hand' as EquipSlot}),
    itm('project-eden','Project EDEN Payload',"Classified. You have it. They want it back.",'legendary','weapon',142,103,0,['bio','aoe'],58,{equipSlot:'hand' as EquipSlot}),
    itm('bioweapon-array','Bioengineered Toxin Array',"Six delivery vectors. Each specific to a different vulnerability.",'legendary','weapon',138,100,0,['bio','aoe','bleed'],56,{equipSlot:'hand' as EquipSlot}),
    itm('tier6-asset','Classified Tier-6 Asset',"The label says Tier-6. You don't want to know Tier-7.",'legendary','weapon',130,95,0,[],53,{equipSlot:'hand' as EquipSlot}),
    itm('decon-cannon','Decontamination Cannon',"Industrial purge system. Handheld. Technically.",'legendary','weapon',152,110,0,['hazmat','aoe','cleanse'],62,{equipSlot:'hand' as EquipSlot}),
    // Armor → protection slot
    itm('director-nbc','Director Chen\'s NBC Suit',"Custom-fitted. Her name is on the collar. She left without it.",'legendary','armor',148,0,148,['hazmat','bio'],60,{equipSlot:'protection' as EquipSlot}),
    itm('power-armor-frame','Last Surviving Power Armor (frame)',"Exoskeleton. Needs power. Has presence anyway.",'legendary','armor',155,0,155,[],63,{equipSlot:'protection' as EquipSlot}),
    itm('containment-shell','Adaptive Containment Shell',"Self-seals breaches. Adapts to hazard signatures. Unnerving.",'legendary','armor',145,0,145,['hazmat','bio','cleanse'],59,{equipSlot:'protection' as EquipSlot}),
    // Utility → hand
    itm('cure7-vial','Last Vial of Cure-7',"Final one. The researcher wrote 'Don't use this' on it. You disagree.",'legendary','utility',115,0,72,['bio','cleanse'],47,{equipSlot:'hand' as EquipSlot}),
    itm('director-badge','Director Chen\'s Access Badge',"Opens every door she ever entered. She entered most of them.",'legendary','utility',118,0,75,['nav'],48,{equipSlot:'hand' as EquipSlot}),
    itm('eden-keycard','Project EDEN Keycard',"Black card. No markings. Tier-above-classified.",'legendary','utility',112,0,70,[],46,{equipSlot:'hand' as EquipSlot}),
    itm('last-broadcast','Last Known Broadcast (recorded)',"Seven minutes of audio. You've listened to it twelve times.",'legendary','utility',110,0,68,[],45,{equipSlot:'hand' as EquipSlot}),
    itm('sporemother-crown','Sporemother\'s Crown',"Grown, not forged. It knows when it's worn.",'legendary','utility',145,0,98,['bio','growth'],59,{equipSlot:'head' as EquipSlot}),
    itm('safe-haven-key','Last Safe Haven Key',"The door it opens is on a map you don't have. Keep the key anyway.",'legendary','utility',140,0,95,['nav'],57,{equipSlot:'hand' as EquipSlot}),
];

// ── UNIQUE: THE 10 PAPERCLIPS ──────────────────────────────────────────────
export const PAPERCLIPS: Item[] = [
    itm('paperclip-10','Half of a Paperclip',"Half a paperclip. Still more valuable than everything else you own.",'unique','utility',150,0,100,[],1,{uniqueDropRate:1/10_000,equipSlot:'hand' as EquipSlot}),
    itm('paperclip-9','Broken Paperclip',"Bent at 90 degrees, then broken. Still said to move mountains. Small ones.",'unique','utility',155,0,103,[],1,{uniqueDropRate:1/13_000,equipSlot:'hand' as EquipSlot}),
    itm('paperclip-8','Rust-Covered Paperclip',"The rust is cosmetic. The value is not.",'unique','utility',158,0,105,[],1,{uniqueDropRate:1/16_000,equipSlot:'hand' as EquipSlot}),
    itm('paperclip-7','Chewed Paperclip',"Something large chewed this. It is still worth more than your safe house.",'unique','utility',162,0,107,[],1,{uniqueDropRate:1/20_000,equipSlot:'hand' as EquipSlot}),
    itm('paperclip-6','Bent Paperclip',"Bent but intact. People have traded buildings for less.",'unique','utility',168,0,110,[],1,{uniqueDropRate:1/24_000,equipSlot:'hand' as EquipSlot}),
    itm('paperclip-5','Unfolded Paperclip',"Completely unfolded. A single wire. A single wire worth everything.",'unique','utility',175,0,115,[],1,{uniqueDropRate:1/30_000,equipSlot:'hand' as EquipSlot}),
    itm('paperclip-4','Twisted Wire Paperclip',"Twisted in on itself twice. Nobody knows why. Nobody questions it.",'unique','utility',182,0,120,[],1,{uniqueDropRate:1/36_000,equipSlot:'hand' as EquipSlot}),
    itm('paperclip-3','Antique Paperclip',"Pre-collapse manufacture. The metallurgy is different. Better.",'unique','utility',190,0,126,[],1,{uniqueDropRate:1/42_000,equipSlot:'hand' as EquipSlot}),
    itm('paperclip-2','Engraved Paperclip',"Microscopic engraving. Three words. You'll need a magnifier to read them.",'unique','utility',198,0,132,[],1,{uniqueDropRate:1/47_000,equipSlot:'hand' as EquipSlot}),
    itm('paperclip-1','Perfectly Preserved Paperclip',"No rust. No bends. Perfect. Said to buy you anything left in the world.",'unique','utility',210,0,140,[],1,{uniqueDropRate:1/50_000,equipSlot:'hand' as EquipSlot}),
];

// ── ALL ITEMS ──────────────────────────────────────────────────────────────
export const ALL_ITEMS: Item[] = [
    ...COMMON,
    ...UNCOMMON,
    ...RARE,
    ...EPIC,
    ...LEGENDARY,
    ...PAPERCLIPS,
];

// ── CONSUMABLES ───────────────────────────────────────────────────────────
export const CONSUMABLES: Item[] = [
    itm('recovery-juice','Recovery Juice',"Tastes wrong. Works right.",'common','consumable',0,0,0,[],5,{buyValue:8,energyRestore:2,equipSlot:'consumable-slot' as EquipSlot}),
    itm('regen-pot-small','Regen Pot (small)',"Labeled SMALL but nobody agrees on the scale.",'common','consumable',0,0,0,[],6,{buyValue:10,energyRestore:3,equipSlot:'consumable-slot' as EquipSlot}),
    itm('regen-pot-med','Regen Pot (medium)',"Half a liter of something that works.",'uncommon','consumable',0,0,0,[],10,{buyValue:18,energyRestore:6,equipSlot:'consumable-slot' as EquipSlot}),
    itm('regen-pot-large','Regen Pot (large)',"You'll feel it tomorrow. Tomorrow is fine.",'rare','consumable',0,0,0,[],18,{buyValue:32,energyRestore:11,equipSlot:'consumable-slot' as EquipSlot}),
    itm('energy-drink','Energy Drink',"Regen rate: 1 per minute for 30 minutes. Side effects unlisted.",'uncommon','consumable',0,0,0,[],12,{buyValue:22,energyBoostDuration:30*60_000,equipSlot:'consumable-slot' as EquipSlot}),
    itm('scout-map','Scout\'s Map',"Someone\'s notes. Next run: lower ambush chance.",'uncommon','consumable',0,0,0,[],10,{buyValue:30,luckBonus:true,equipSlot:'consumable-slot' as EquipSlot}),
    itm('magnifier-small','Magnifying Glass (5-min)',"Speeds up research by 5 minutes.",'common','consumable',0,0,0,[],8,{buyValue:15,researchBoostMs:5*60_000,equipSlot:'consumable-slot' as EquipSlot}),
    itm('magnifier-med','Magnifying Glass (15-min)',"Speeds up research by 15 minutes.",'uncommon','consumable',0,0,0,[],15,{buyValue:28,researchBoostMs:15*60_000,equipSlot:'consumable-slot' as EquipSlot}),
    itm('magnifier-large','Magnifying Glass (30-min)',"Completes any research instantly.",'rare','consumable',0,0,0,[],25,{buyValue:50,researchBoostMs:999*60_000,equipSlot:'consumable-slot' as EquipSlot}),
];

// ── LOOKUP & ROLLING ─────────────────────────────────────────────────────
import { CRAFTED_ITEMS } from './crafting.ts';

export function getItemById(id: string): Item | undefined {
    return ALL_ITEMS.find(i => i.id === id)
        ?? CONSUMABLES.find(i => i.id === id)
        ?? CRAFTED_ITEMS.find(i => i.id === id);
}

const RARITY_ORDER: Record<string, number> = {
    common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, unique: 5,
};
const RARITY_WEIGHTS: Record<string, number> = {
    common: 5000, uncommon: 2500, rare: 1000, epic: 300, legendary: 100,
};

export function rollRandomItem(minRarity: string, maxRarity: string): Item {
    const minIdx = RARITY_ORDER[minRarity] ?? 0;
    const maxIdx = RARITY_ORDER[maxRarity] ?? 5;

    // Check for unique paperclip drops (only when location allows unique)
    if (maxIdx >= 5) {
        for (const pc of PAPERCLIPS) {
            if (pc.uniqueDropRate && Math.random() < pc.uniqueDropRate) {
                return pc;
            }
        }
    }

    // Normal non-unique roll
    const pool = ALL_ITEMS.filter(item => {
        if (item.rarity === 'unique') return false;
        const idx = RARITY_ORDER[item.rarity] ?? 0;
        return idx >= minIdx && idx <= Math.min(maxIdx, 4);
    });

    if (pool.length === 0) return ALL_ITEMS[0];

    const totalWeight = pool.reduce((sum, item) => sum + (RARITY_WEIGHTS[item.rarity] ?? 1), 0);
    let roll = Math.random() * totalWeight;
    for (const item of pool) {
        roll -= RARITY_WEIGHTS[item.rarity] ?? 1;
        if (roll <= 0) return item;
    }
    return pool[pool.length - 1];
}

// Secondary (bonus) loot — never unique, capped one tier below location max
const SECONDARY_CONFIG: Record<LocationDanger, { chance: number; maxItems: number; maxRarity: string }> = {
    low:     { chance: 0.22, maxItems: 1, maxRarity: 'common' },
    medium:  { chance: 0.32, maxItems: 2, maxRarity: 'uncommon' },
    high:    { chance: 0.42, maxItems: 2, maxRarity: 'rare' },
    extreme: { chance: 0.52, maxItems: 3, maxRarity: 'epic' },
};

const RUINS_CONSUMABLE_CHANCE: Record<LocationDanger, number> = {
    low: 0.07, medium: 0.11, high: 0.15, extreme: 0.20,
};

export function rollSecondaryItems(danger: LocationDanger, minRarity: string, luckBonus: boolean): Item[] {
    const cfg = SECONDARY_CONFIG[danger];
    const chance = luckBonus ? Math.min(cfg.chance * 1.4, 0.85) : cfg.chance;
    const results: Item[] = [];

    // Small chance to find a consumable (mag glass or regen pot) alongside gear
    const ruinsConsumables = CONSUMABLES.filter(c =>
        c.id === 'magnifier-small' || c.id === 'regen-pot-small' ||
        c.id === 'regen-pot-med' || c.id === 'magnifier-med'
    );
    if (Math.random() < RUINS_CONSUMABLE_CHANCE[danger] && ruinsConsumables.length > 0) {
        results.push(ruinsConsumables[Math.floor(Math.random() * ruinsConsumables.length)]);
    }

    for (let i = 0; i < cfg.maxItems; i++) {
        if (Math.random() < chance) {
            results.push(rollRandomItem(minRarity, cfg.maxRarity));
        }
    }
    return results;
}

export function generateTraderInventory(): Item[] {
    // 4 rotating flex items
    const flexConsumables = CONSUMABLES.filter(c =>
        c.id !== 'magnifier-small' && c.id !== 'regen-pot-small'
    );
    const gearRarities = ['common', 'uncommon', 'uncommon', 'rare', 'rare'];
    const gearCount = 2 + Math.floor(Math.random() * 2);
    const items: Item[] = [];
    for (let i = 0; i < gearCount; i++) {
        const rarity = gearRarities[Math.floor(Math.random() * gearRarities.length)];
        items.push(rollRandomItem(rarity, rarity));
    }
    const shuffled = [...flexConsumables].sort(() => Math.random() - 0.5);
    for (let i = 0; items.length < 4 && i < shuffled.length; i++) {
        items.push(shuffled[i]);
    }
    return items.slice(0, 4);
}
