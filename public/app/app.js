// Simple pre-auth gate: validate session cookie with a serverless function
async function checkAuth() {
  try {
    const res = await fetch('/.netlify/functions/auth_check');
    if (res.ok) {
      document.getElementById('gate').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      return true;
    }
  } catch(e) {}
  const gate = document.getElementById('gate');
  gate.innerHTML = '<p>Not authorised. <a href="/login">Login</a></p>';
  return false;
}

checkAuth();

// --- Randomizer data (trimmed starter set; expand as you wish) ---
const DATA = {
  primaries: [
    { name: "AK-74N", tier:"mid" }, { name:"M4A1", tier:"high" },
    { name:"SKS", tier:"low" }, { name:"MP-153", tier:"low" },
    { name:"HK416A5", tier:"high" }, { name:"MP-7A2", tier:"mid" }
  ],
  secondaries: [
    { name:"Glock 17", tier:"low" }, { name:"USP .45", tier:"mid" },
    { name:"M9A3", tier:"mid" }, { name:"FN Five-seveN", tier:"high" }
  ],
  ammo: {
    primary: {
      low:["PS","PRS","7mm buck"],
      mid:["BT","M855","AP20"],
      high:["BP","M995","AP-20 Slug (alt)"]
    },
    secondary: {
      low:["9x19 PST","9x19 Luger CCI"],
      mid:[".45 ACP FMJ",".357 SIG FMJ"],
      high:["9x19 AP 6.3",".45 ACP AP"]
    }
  },
  armor: ["PACA","6B23-1","Trooper","BNTI Kirasa","Gen4 Assault","Slick"],
  rigs: ["Scav Vest","Belt Combo","Bank Robber","Triton","AVS","BlackRock"],
  backpacks: ["Sling","Berkut","Tri-Zip","Pilgrim","Attack 2","6Sh118"],
  util: ["Flashlight","Laser","Rangefinder","Compass","Marker","Golden Star"],
  meds: ["AI-2","Car First Aid","Salewa","IFAK","Grizzly"],
  stims: ["L1","SJ6","Propital","Adrenaline","Zagustin"],
  maps: ["Customs","Woods","Shoreline","Interchange","Reserve","Factory","Lighthouse","Streets","Ground Zero"]
};

function pick(list){ return list[Math.floor(Math.random()*list.length)]; }

function rollLoadout() {
  const preFlea = document.getElementById('preFlea').checked;
  const highTierAmmo = document.getElementById('highTierAmmo').checked;
  const meme = document.getElementById('memeItems').checked;

  // Weapons
  const prim = pick(DATA.primaries);
  const sec = pick(DATA.secondaries);

  // Ammo rules
  const pAmmoTier = highTierAmmo ? "high" : (preFlea ? "low" : "mid");
  const sAmmoTier = highTierAmmo ? "high" : (preFlea ? "low" : "mid");
  const pAmmo = pick(DATA.ammo.primary[pAmmoTier]);
  const sAmmo = pick(DATA.ammo.secondary[sAmmoTier]);

  // Gear
  const armor = pick(DATA.armor.slice(0, preFlea ? 4 : DATA.armor.length));
  const rig = pick(DATA.rigs.slice(0, preFlea ? 3 : DATA.rigs.length));
  const backpack = pick(DATA.backpacks.slice(0, preFlea ? 3 : DATA.backpacks.length));

  let util = pick(DATA.util);
  if (!meme && util === "Golden Star") util = "Bandage";

  const meds = pick(DATA.meds);
  const stim = pick(DATA.stims);
  const map = pick(DATA.maps);

  // Modifiers
  const modifiers = [];
  if (preFlea) modifiers.push("No Flea items");
  if (!highTierAmmo) modifiers.push("Mid/low-tier ammo");
  if (meme) modifiers.push("Include one meme item");

  // Render
  document.getElementById('primary').textContent = prim.name;
  document.getElementById('primaryAmmo').textContent = pAmmo;
  document.getElementById('secondary').textContent = sec.name;
  document.getElementById('secondaryAmmo').textContent = sAmmo;
  document.getElementById('armor').textContent = armor;
  document.getElementById('rig').textContent = rig;
  document.getElementById('backpack').textContent = backpack;
  document.getElementById('util').textContent = util;
  document.getElementById('meds').textContent = meds;
  document.getElementById('stims').textContent = stim;
  document.getElementById('map').textContent = map;
  document.getElementById('modifiers').textContent = modifiers.join(" • ") || "None";
}

document.getElementById('roll')?.addEventListener('click', rollLoadout);
document.getElementById('logout')?.addEventListener('click', async () => {
  await fetch('/.netlify/functions/logout', { method:'POST' });
  window.location.href = "/login";
});
