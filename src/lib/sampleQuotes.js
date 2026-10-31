// Sample subcontracted quotes used by the import screen, one per finishing trade.
// Plastering is the original painting sample reworked into a linings quote, so the
// samples read as different trades rather than a repaint with a new heading.

const HEADER = 'Area,Description,Quantity,Unit,Rate,Amount';

export const SAMPLES = [
  {
    id: 'plastering',
    trade: 'Plastering and linings',
    csv: `${HEADER}
L1 Apartments,Set and stop plasterboard to walls,2650,m2,18.40,48760
L1 Apartments,Set and stop plasterboard to ceilings,980,m2,19.60,19208
L1 Apartments,Supply and fix 90mm cornice,1420,lm,9.80,13916
L1 Apartments,Wet area sheeting and waterproof prep,210,m2,26.50,5565
L1 Apartments,Square set shadowline to ceilings,180,lm,24.00,4320
L1 Apartments,Sand and patch to paint finish,3630,m2,3.20,11616
L1 Corridors,Set and stop plasterboard to walls,1240,m2,18.40,22816
L1 Corridors,Set and stop plasterboard to ceilings,420,m2,19.60,8232
L1 Corridors,Access panels supply and install,46,no,145,6670
L1 Corridors,Supply and fix 90mm cornice,380,lm,9.80,3724
L1 Lobby,Bulkhead framing and sheeting,120,m2,32.00,3840
L1 Lobby,Acoustic ceiling insulation,260,m2,11.20,2912
L2 Apartments,Set and stop plasterboard to walls,2650,m2,18.40,48760
L2 Apartments,Set and stop plasterboard to ceilings,980,m2,19.60,19208
L2 Apartments,Supply and fix 90mm cornice,1420,lm,9.80,13916
Stair 1,Fire rated stair wall sheeting,460,m2,22.60,10396
Stair 2,Fire rated stair wall sheeting,460,m2,22.60,10396
External,Fibre cement soffit lining,320,m2,26.80,8576
Allowance,Hoarding and protection of finished surfaces,1,item,4800,4800
Allowance,Waste removal and site clean before handover,1,item,6200,6200`,
  },
  {
    id: 'ceilings',
    trade: 'Suspended ceilings',
    csv: `${HEADER}
L1 Corridors,Suspended grid ceiling and acoustic tiles 600x600,1240,m2,44.00,54560
L1 Corridors,Bulkhead framing and lining to perimeter,380,lm,96,36480
L1 Corridors,Access panels set into grid,46,no,185,8510
L1 Corridors,Aluminium shadowline trim,380,lm,18.50,7030
L1 Apartments,Suspended ceiling to bathrooms with moisture tiles,210,m2,52.00,10920
L1 Apartments,Exhaust and downlight cutouts to grid,84,no,42,3528
L1 Lobby,Feature baffle ceiling to entry,120,m2,128,15360
L1 Lobby,Acoustic ceiling insulation batts,260,m2,14.50,3770
L1 Lobby,Curved plasterboard bulkhead to lift lobby,46,lm,145,6670
L2 Corridors,Suspended grid ceiling and acoustic tiles 600x600,980,m2,44.00,43120
L2 Corridors,Bulkhead framing and lining to perimeter,340,lm,96,32640
Stair 1,Suspended ceiling to stair landings,90,m2,68,6120
Stair 2,Suspended ceiling to stair landings,90,m2,68,6120
Allowance,Seismic bracing and certification,1,item,4200,4200
Allowance,Protection and clean of ceiling tiles before handover,1,item,2200,2200`,
  },
  {
    id: 'painting',
    trade: 'Painting and decorating',
    csv: `${HEADER}
L1 Apartments,Prepare and paint plasterboard walls PT1 low sheen to schedule,2650,m2,12.10,32065
L1 Apartments,Prepare and paint ceilings PT4 flat white,980,m2,13.90,13622
L1 Apartments,Paint doors frames and trims enamel,168,no,132,22176
L1 Apartments,Paint wet area ceilings moisture resistant,210,m2,16.40,3444
L1 Apartments,Feature walls two pack finish,180,m2,24.50,4410
L1 Apartments,Seal and paint skirtings and architraves,1420,lm,8.40,11928
L1 Corridors,Prepare and paint walls PT1 low sheen,1240,m2,12.50,15500
L1 Corridors,Prepare and paint ceilings PT4 flat,420,m2,14.80,6216
L1 Corridors,Paint doors and frames enamel,46,no,145,6670
L1 Lobby,Feature ceiling two pack to detail,120,m2,32.00,3840
L1 Lobby,Wall protection clear sealer,260,m2,11.20,2912
L2 Apartments,Prepare and paint plasterboard walls PT1 low sheen,2650,m2,12.10,32065
L2 Apartments,Prepare and paint ceilings PT4 flat white,980,m2,13.90,13622
L2 Corridors,Prepare and paint walls PT1 low sheen,980,m2,12.50,12250
Stair 1,Prepare and paint walls and ceilings low sheen,460,m2,15.60,7176
Stair 2,Prepare and paint walls and ceilings low sheen,460,m2,15.60,7176
External,Paint soffits and fascias weathershield,320,m2,19.80,6336
Allowance,Protection of finished surfaces all levels,1,item,4800,4800
Allowance,Site clean and touch up before handover,1,item,6200,6200`,
  },
  {
    id: 'tiling',
    trade: 'Tiling',
    csv: `${HEADER}
L1 Apartments,Screed and waterproof bathroom floors,210,m2,48.00,10080
L1 Apartments,Wall tiling 600x300 to bathrooms,640,m2,78.00,49920
L1 Apartments,Floor tiling 300x300 to bathrooms,210,m2,72.00,15120
L1 Apartments,Tile skirting to wet areas,420,lm,22.00,9240
L1 Apartments,Epoxy grout to all wet areas,850,m2,8.50,7225
L1 Apartments,Balcony tiling to falls,320,m2,88.00,28160
L1 Apartments,Trim and movement joints,260,lm,16.50,4290
L1 Corridors,Porcelain floor tiling 600x600,480,m2,82.00,39360
L1 Corridors,Tiled skirting and capping,180,lm,24.00,4320
L1 Lobby,Feature wall tiling to lift surrounds,90,m2,96.00,8640
L1 Lobby,Stone thresholds supply and install,24,no,85,2040
L2 Apartments,Wall tiling 600x300 to bathrooms,640,m2,78.00,49920
L2 Apartments,Floor tiling 300x300 to bathrooms,210,m2,72.00,15120
L2 Apartments,Balcony tiling to falls,320,m2,88.00,28160
Allowance,Protection of tiled surfaces,1,item,3200,3200
Allowance,Silicone and final clean to wet areas,1,item,4800,4800`,
  },
  {
    id: 'waterproofing',
    trade: 'Waterproofing',
    csv: `${HEADER}
L1 Apartments,Waterproofing membrane to bathroom floors,210,m2,62.00,13020
L1 Apartments,Waterproofing membrane to bathroom walls to 1800,640,m2,48.00,30720
L1 Apartments,Preformed bandage and corner detailing,420,lm,18.50,7770
L1 Apartments,Shower recess screed to falls,84,no,165,13860
L1 Apartments,Flood test and certification,84,no,85,7140
L1 Apartments,Balcony membrane with upturn,320,m2,68.00,21760
L1 Apartments,Waterstop angle to door thresholds,168,lm,22.00,3696
L1 Corridors,Membrane to planter boxes,90,m2,76.00,6840
L1 Lobby,Below slab membrane to entry threshold,120,m2,58.00,6960
L2 Apartments,Waterproofing membrane to bathroom floors,210,m2,62.00,13020
L2 Apartments,Waterproofing membrane to bathroom walls to 1800,640,m2,48.00,30720
L2 Apartments,Flood test and certification,84,no,85,7140
Allowance,Protection board over membrane,1,item,2600,2600
Allowance,Make good and re-test after following trades,1,item,3400,3400`,
  },
  {
    id: 'carpentry',
    trade: 'Carpentry and joinery',
    csv: `${HEADER}
L1 Apartments,Supply and install door frames,168,no,132,22176
L1 Apartments,Hang solid core doors,168,no,96,16128
L1 Apartments,Door hardware sets,168,no,78,13104
L1 Apartments,Skirting and architrave supply and fix,1420,lm,14.80,21016
L1 Apartments,Kitchen carcass and cabinet install,42,no,480,20160
L1 Apartments,Laminate benchtops supply and install,42,no,320,13440
L1 Apartments,Wardrobe shelving and rails,84,no,165,13860
L1 Corridors,Fire door sets supply and install,46,no,385,17710
L1 Corridors,Door closers and signage,46,no,96,4416
L1 Lobby,Reception joinery to detail,1,item,8600,8600
L1 Lobby,Feature timber battens to wall,120,m2,68,8160
L2 Apartments,Supply and install door frames,168,no,132,22176
L2 Apartments,Hang solid core doors,168,no,96,16128
L2 Apartments,Kitchen carcass and cabinet install,42,no,480,20160
Allowance,Hardware schedule and shop drawings,1,item,3600,3600
Allowance,Make good and adjust doors before handover,1,item,4200,4200`,
  },
  {
    id: 'rendering',
    trade: 'Rendering and external finishes',
    csv: `${HEADER}
External,Two coat cement render to walls,1240,m2,42.00,52080
External,Render to columns and beams,320,m2,56.00,17920
External,Fibreglass mesh and base coat to soffits,480,m2,34.00,16320
External,Acrylic texture coat to entry walls,260,m2,38.00,9880
External,Rendered reveals and sills,380,lm,26.00,9880
External,Movement joints to rendered walls,240,lm,18.50,4440
External,Render repair and patching for handover,1,item,3400,3400
External,Bubble deck and control joints,120,lm,22.00,2640
Allowance,Scaffold hire and protection while rendering,1,item,9600,9600
Allowance,Clean down glazing and frames after render,1,item,2800,2800`,
  },
];

export const SAMPLE_PLACEHOLDER = `${HEADER}
L1 Apartments,Set and stop plasterboard to walls,2650,m2,18.40,48760`;