include <BOSL2/std.scad> //You will need to install the BOSL2 library to your openSCAD library (https://github.com/BelfrySCAD/BOSL2):
$fn = 100;

show_body = true;
show_lid = true;
lid_offset = true;  //for 3d printing
show_cap = true;
preview_electronics = false; //false for printing
show_mold = false;

seed_w = 18;
seed_h = 2;
seed_l = 21;
usb_d = 9;
usb_w = 9;
usb_h = 3.5;
button_w = 4.5;
button_d = 3.5;
switch_hinge_w = 1;
seed_clearance_h = 1.5;
seed_clearance_w = 13.5;

ps_w = 8;
ps_h = 10;
ps_d = 8;

battery_w = 50;
battery_h = 20;
battery_d = 10;

box_iw = 60;
box_ih = 23;
box_id = 16;
box_top_rise = 3;
box_fillet = 5;
box_bottom_fillet_hack = 5;
box_lid_h = 5.5;
box_lid_side_clip_h = 2;
box_lid_side_clip_l = 7 + box_lid_side_clip_h;
box_lid_side_clip_w = 10;


shaft_od = 12;
shaft_h = 25;

cap_bottom_h = 10;
cap_middle_h = 5;
cap_top_h = 25;
cap_middle_od = 27;

wall_thickness = 2;
tubing_od = 3;
tubing_od_allowance = 1;

switch_screw_l = 19;
switch_screw_d = 1.5;
switch_l = 24;
switch_w = 11;
switch_h = 11;
switch_lever_l = 10;
switch_lever_w = 4;
switch_lever_h = 3;

if (show_lid && !show_mold) 
  if (lid_offset) 
    translate([box_ih, 0, + box_lid_h ]) 
      lid();
  else 
  //translate([box_id/2,0,-box_ih]) 
  lid();
if (show_body && !show_mold) body();
if (show_cap && !show_mold) cap();

box_points = [
  [-box_iw / 2 - wall_thickness * 2, -box_ih / 2 - box_fillet - wall_thickness], //bottom left
  [box_iw / 2 + wall_thickness * 2, -box_ih / 2 - box_fillet - wall_thickness], //bottom right
  //[box_iw/2 + wall_thickness,                     box_ih/2], //top right corner
  for (
    //top right side curve;
    i = bezpath_curve(
      [
        [box_iw / 2 + wall_thickness, box_ih / 2 - box_fillet],
        [box_iw / 2 + wall_thickness, box_ih / 2 - box_fillet / 2],
        [box_iw / 2 + wall_thickness - box_fillet / 2, box_ih / 2],
        [box_iw / 2 + wall_thickness - box_fillet, box_ih / 2 + (box_fillet / (box_iw / 2 + wall_thickness))],
      ]
    )
  ) i,
  [shaft_od / 2 + tubing_od + tubing_od_allowance, box_ih / 2 + box_top_rise], //shaft right
  [-shaft_od / 2 - tubing_od - tubing_od_allowance, box_ih / 2 + box_top_rise], //shaft left
  //[-box_iw/2 - wall_thickness,                    box_ih/2]  //top left corner
  for (
    //top left side curve;
    i = bezpath_curve(
      [
        [-box_iw / 2 - wall_thickness + box_fillet, box_ih / 2 + (box_fillet / (box_iw / 2 + wall_thickness))],
        [-box_iw / 2 - wall_thickness + box_fillet / 2, box_ih / 2],
        [-box_iw / 2 - wall_thickness, box_ih / 2 - box_fillet / 2],
        [-box_iw / 2 - wall_thickness, box_ih / 2 - box_fillet],
      ]
    )
  ) i,
];

bottom_of_shaft = box_ih / 2 + box_top_rise + wall_thickness;

module body() {
  //components compartment
  difference() {
    #union() {
      translate([-box_id / 2 - wall_thickness, 0, tubing_od_allowance * 2])
        rotate([90, 0, 90])
          //filleted top and bottom
          fillet_extrude(height=box_id + wall_thickness * 2, r1=-5, r2=-5)
            polygon(box_points);

      //shaft tubing collar
      difference() {
        translate([0, 0, bottom_of_shaft]) cylinder(h=shaft_od / 2 -.5, d1=box_id + wall_thickness*2 - .825, d2=shaft_od, center=true); //.825 to account for fillet overlap
        translate([0, 0, bottom_of_shaft + 2.75]) torus(id=shaft_od-.001, od=shaft_od * 2, $fn=100);
      }
    }

    //cut off bottom of box
    translate([0, 0, -box_ih / 2 - box_fillet - wall_thickness/2])
      cube([box_iw + wall_thickness * 2, box_iw + wall_thickness * 2 + box_fillet * 2, box_fillet * 2], center=true);

    //insert for esp32
    translate([0,-box_iw/2 + seed_l/2 - wall_thickness, -box_ih/2  -.2501]) qt_py_esp32s3(); //.25 because im getting overhang artifacts when it's flush
    //translate([0, box_iw/2 - seed_l/2 + wall_thickness, -box_ih / 2 +3]) qt_py_bff();

    if (!show_mold) {

      //cavity for electronics
      translate([0, 0, -wall_thickness/2])
        cube([box_id, box_iw, box_ih], center=true);

      //center hole for wire
      cylinder(h=shaft_h + 2, d=tubing_od, center=true); 

      //hole for pressure tube
      translate([shaft_od / 2 + tubing_od / 2, -shaft_od/4, bottom_of_shaft])
        rotate([-45, 0, 0])
          cylinder(h=box_ih, d=tubing_od + tubing_od_allowance / 2, center=true);

      //hole for pressure tube onto shaft
      translate([shaft_od / 2 + tubing_od / 2 + .25,0, bottom_of_shaft+tubing_od/2 + .25]) {

        //this is a failed attempt to use an arc of torus, but i still think its the right approach eventually so it stays
        // rotate([-5,0,0]) translate ([0,1,0]) intersection() {
        //   translate([0,-3,2]) rotate([20,0,0]) rotate([0,90,0]) cylinder(h=30, d=16, center=true,$fn=3);
        //   c = 10;
        //   translate([1,1,-c/1.5 ]) rotate([0,90,-2]) torus(od=c+shaft_od, id=c);     
        // }
       translate([1.1,0,.75]) rotate([110,-15,-8]) cylinder (h=8, d=shaft_od/2, center=true);  //just another cylinder for now

      //tab stays
      for (side = [0,-1]) 
        translate([side *  box_id + .25, 0, - box_ih - wall_thickness]) 
          rotate([90,0,0]) 
            cylinder(h=box_lid_side_clip_w + 4, d=box_lid_side_clip_h + .5, center=true);

      }
        // rotate([-67.5, 0, 0])
        //   cylinder(h=18, d=tubing_od + tubing_od_allowance / 2, center=true);
    }
  }

  if (!show_mold) {
    //shaft
    difference() {
      translate([0, 0, bottom_of_shaft + shaft_h / 2])
        cylinder(h=shaft_h, d=shaft_od, center=true);
      //shaft

      translate([0, 0, bottom_of_shaft + shaft_h / 2])
        cylinder(h=shaft_h + 2, d=tubing_od, center=true);
      //hole up the middle
      translate([0, 0, bottom_of_shaft + shaft_h - tubing_od / 2])
        rotate([90, 0, 0])
          cylinder(h=cap_middle_od + 2, d=tubing_od + tubing_od_allowance / 2, center=true);
      //hole for tubing end
    }
  }
}

top_of_shaft = bottom_of_shaft + shaft_h;

module cap() {
  cap_points = [
    [0, top_of_shaft], //point
    [tubing_od / 4, top_of_shaft],
    [tubing_od / 2, top_of_shaft],
    [shaft_od / 2 + tubing_od / 2, top_of_shaft], //point
    [shaft_od / 2 + tubing_od / 2, top_of_shaft + cap_bottom_h / 4],
    [cap_middle_od / 2 * .75, top_of_shaft + cap_bottom_h - cap_middle_h / 4],
    [cap_middle_od / 2 * .875, top_of_shaft + cap_bottom_h], //point
    [cap_middle_od / 2, top_of_shaft + cap_bottom_h + cap_middle_h / 4],
    [cap_middle_od / 2, top_of_shaft + cap_bottom_h + cap_middle_h * .75],
    [cap_middle_od / 2, top_of_shaft + cap_bottom_h + cap_middle_h], //point
    [cap_middle_od / 2, top_of_shaft + cap_bottom_h + cap_middle_h + cap_top_h / 4],
    [shaft_od / 2, top_of_shaft + cap_bottom_h + cap_middle_h + cap_top_h],
    [0, top_of_shaft + cap_bottom_h + cap_middle_h + cap_top_h], //point
  ];
  rotate_extrude()
    //create cap shape
    polygon(bezpath_curve(cap_points));
}

module lid() {
  //components back cover
  translate([0, 0,-box_ih / 2 - 1]) { // magic -1
    //?
    color("purple") 
      //scale([1, 1, .5])
        difference() {
            cuboid ([box_id + wall_thickness * 2, box_iw + wall_thickness * 3.75, box_lid_h * 2], rounding=box_fillet,edges="Z"); //lid box);

          //cut off top
          translate([0,0, box_lid_h/2]) 
            cube([box_iw + wall_thickness * 2, box_iw + wall_thickness * 2 + box_fillet * 2, box_lid_h +2],center=true);

          //usb cutout
          //translate([0,-box_iw/2 - usb_d + wall_thickness/2,-.5])cube([usb_w + 2, usb_d*2, usb_h + 2], center=true); //magic .5 for height clarance

          //esp32 cutout
          translate([0,-box_iw/2 + seed_l/2 - wall_thickness, -.5]) qt_py_esp32s3(); 
          // translate([0, box_iw/2 - seed_l/2 + wall_thickness, 2.25]) qt_py_bff();  //.25 of cheat
          translate([0, box_iw/2 - switch_l/2 + wall_thickness, switch_lever_h/2]) switch();

          //button press mechanism 
         // #translate([-button_w/2, -box_iw/2 + wall_thickness + button_d/2, -5])
        }

        //bff stays
        // translate([0, box_iw/2 - seed_l/2 + wall_thickness, 1.5]) {
        //   for (side = [-1, 1]) 
        //     color("green") translate([side*6,2.5,-2]) cube([2,4,2], center=true);
        // }

        //side clips
        for (side = [-1, 1]) {

          translate([(box_id/2 - box_lid_side_clip_h/1.5) * side,0, (box_lid_side_clip_l - 2)/2])  //review this, outer edge positions are moving with box_lid_side_clip_h
            rotate([0,0,180 * (side -1)/2])
              difference() {
                translate([0, 0, -box_lid_side_clip_h/2])    
                  cube([box_lid_side_clip_h * 1.5, box_lid_side_clip_w, box_lid_side_clip_l - box_lid_side_clip_h], center=true);
                translate([   - box_lid_side_clip_h/1.5, 0, 0]) 
                  cuboid([box_lid_side_clip_h, box_lid_side_clip_w+1, box_lid_side_clip_l],rounding=box_lid_side_clip_h/2, edges="Y");
              }
              //tab stays
              translate([side *  box_id/2, 0, box_lid_side_clip_l/2 + .25]) 
                rotate([90,0,0]) 
                  cylinder(h=box_lid_side_clip_w, d=box_lid_side_clip_h + .5, center=true);
        }

        if (preview_electronics) {
                    translate([0,-box_iw/2 + seed_l/2 - wall_thickness, -.5]) qt_py_esp32s3(); 
                    // translate([0,box_iw/2 - seed_l/2 + wall_thickness, 2.5]) qt_py_bff(); 
        }
  }
  translate([box_id, 0, -box_ih/2 - box_lid_h - 1]) { // + .75  //box_id / 2 + wall_thickness + 5
    translate([0,button_w * 3,0]) {
      translate([0,button_w * 2]) rotate([90,0,0]) {
        //slider arm
          difference() {
            union() {

              // translate([-1,2.5, -6.5])
              //   color("brown") rotate([0,90,0]) cylinder(h=button_w, d=1.6, center=true); //cube([button_w, 5, 1], center=true); 

              // intersection() {
              //   translate([-1,2.5, -6.5])
              //     difference() {
              //       rotate([0,90,0]) cylinder(h=button_w, d=9, center=true); //cube([button_w, 5, 1], center=true); 
              //       rotate([0,90,0]) cylinder(h=button_w, d=7, center=true); //cube([button_w, 5, 1], center=true); 
              //     }
              //   translate([-1,2.5, -3])
              //     color("brown") cube([button_w, 5, 2], center=true); 
              // }

              //channel for slider arm
              // translate([-1, 2.5,1 -seed_h - switch_lever_h - box_lid_h/2 -.25])
              //   color("green") cube([.8, 5, box_lid_h+3], center=true); //channel w needed = 8


              // translate([0, seed_l/2 - button_d, .8 ])
              //   color("brown") cube([button_w-.5, 5, 1.6], center=true); 

              // translate([0, seed_l/2 - button_d,box_lid_h/2 + 1])
              //   color("orange") cube([.8, 5, box_lid_h + 2], center=true); 
            }
          // translate([-1, 2.5,-3])
          //   color("purple") cube([ 1,3,2.4], center=true);  // cube([ 1,1.6,2.4], center=true); 

          }

      }
      //  scale ([1.2,1,1]) button(height=2);
    }
    //  scale ([1.2,1,1]) button();
  }
}
overall_height = bottom_of_shaft + box_id / 2 + shaft_h + cap_bottom_h + cap_middle_h + cap_top_h + box_top_rise + wall_thickness;


if (show_mold) {
  scale([1.1, 1.1, 1.1]) {
    difference() {
      union() {
        #translate([0, 0, (overall_height) / 2 - box_id + wall_thickness *2])
          cylinder(h=overall_height + wall_thickness*2, d=cap_middle_od + 4, center=true);//shaft

        #translate([0, 0, (wall_thickness + box_top_rise) / 2])
          cube([box_id + wall_thickness * 4 + 6, box_iw + wall_thickness * 6, box_ih + wall_thickness * 2 + box_top_rise], center=true);
      }
      translate([0, 0, - box_id + wall_thickness]) cylinder(h=overall_height + wall_thickness , d=cap_middle_od);  //review this, box id shouldn't be for z

      body();
      cap();

      translate([0, 0, -box_id + 2.5]) //review this, box id shouldn't be for z
        cube([box_id + wall_thickness * 4 + 6, box_iw + wall_thickness * 6, 1], center=true);
    }
  }
}

module switch() {
  color("red") cube([switch_w, switch_l, switch_h], center=true); //switch body
  translate([0,0,-switch_h/2 - switch_lever_h/2]) cube([switch_lever_w, switch_lever_l, switch_lever_h], center=true); //switch body clearance
  for (x = [-1:2:1]) translate([0,switch_screw_l/2*x,0])  {
    color("blue") cylinder(h=switch_screw_l, d=switch_screw_d, center=true); //screw hole
  }
}




module button(diameter = 2.5, height = 3, arm_h = 1.25, arm_w = .5 ) {
  translate([0,0,arm_h/2]) {
    cube([arm_w,diameter*2,arm_h], center=true); 
    cube([diameter*2,arm_w,arm_h], center=true); 
  }
  cylinder(h=height, d=diameter);
}


module qt_py_esp32s3() {
  {
    color("red") rotate([0,0,0]) cuboid([seed_w, seed_l, seed_h], rounding=1, edges="Z"); //qt py esp32-s3

  translate([0,  -usb_d + 1,  - usb_h/2 - seed_h/2])
    color("pink") cube([usb_d, usb_w, usb_h], center=true); //usb port

  translate([0,  -usb_d * 2 + wall_thickness * 2,  - usb_h/2 - seed_h/2])
    color("transparent") cube([usb_w + 1, usb_d, usb_h + 1], center=true); //usb port clearance

  translate([2.5,  usb_d + .5,  -seed_h/2 - usb_h/2])
    color("yellow") cube([usb_d, usb_w, usb_h], center=true); //i2c port, same clearance as usb

  //button 1 (sleep)
  translate([-button_w/2 - .75, -.5, -seed_h ]) scale ([1.2,1,1]) {
    color("orange") cube([button_w, button_d, switch_lever_h], center=true); //switch

    // translate([0,0, - switch_lever_h/2]) 
    //   rotate([0,180,0]) button(); 

    // translate([0,0,0]) color("transparent") 
    //   rotate([0,180,0]) button(arm_w=1.25, arm_h=1.625+switch_lever_h/2,height=5, diameter=3.5); 

  }

  //button 2 (reset)
  translate([-button_w/2 - .75, button_d -.25, -seed_h ]) scale ([1.2,1,1]) {
    color("orange") cube([button_w, button_d, switch_lever_h], center=true); //switch

    // translate([0,0, - switch_lever_h/2]) 
    //   rotate([0,180,0]) button(height=2); 

    // translate([0,0,0]) color("transparent") 
    //   rotate([0,180,0]) button(arm_w=1.25, arm_h=1.625+switch_lever_h/2,height=5, diameter=3.5); 
  }

  translate([0,  0, 0])
      color("transparent") cube([seed_clearance_w, seed_l, seed_clearance_h * 2 + seed_h], center=true); //component clearance

  //cutout for switch press mechanism
  // translate([-button_w/2-1, -1.5, -seed_h - switch_lever_h/2])
  // difference() {
  //   color("transparent") cube([button_w + switch_hinge_w, button_d + switch_hinge_w*2, switch_h*2], center=true); 
  //   translate([ switch_hinge_w /2,0,0]) cube([button_w, button_d, switch_h*2], center=true); //magic 1
  // }

  }
}  

module qt_py_bff() {
  //battery buddy pcb
  color("red")  cuboid([seed_w, seed_l-2, seed_h], rounding=1, edges="Z"); //qt py esp32-s3
  //color("transparent") translate([0,0,-2.5]) cuboid([seed_w, seed_l-2, 3], rounding=1, edges="Z"); //qt py esp32-s3

  //jst for battery
  translate([0,  -usb_d ,  -seed_h/2 - usb_h/2 - 2])
    color("yellow") cube([usb_d, usb_w, usb_h+2], center=true); //i2c port, same clearance as usb

  //slider on/off switch
  translate([-1, seed_l/2 - button_d - 3.5, -seed_h ])
    color("orange") cube([button_w, button_d*2, switch_lever_h], center=true); 

  //channel for slider arm
  translate([-1,1.5, -6])
    color("transparent") cube([button_w, 13, 2], center=true); 

  translate([-1, 1.5,1.25 -seed_h - switch_lever_h - box_lid_h/2 +.5])
    color("transparent") cube([1.6, 13.5, box_lid_h], center=true); //channel w needed = 8

  //channel start insert for arm
  translate([-1,-3, -4])
    color("transparent") cube([button_w, 4, 2], center=true); 

   color("green")  translate([-1, 2.5,1.25 -seed_h - switch_lever_h - box_lid_h/2 + 1.5]) rotate([0,90,0]) cylinder(h=button_w, d=1.6, center=true);
}


if (preview_electronics) {
  //preview of electronics layout
  translate([4, -24, 0])
    color("green") cube([ps_d, ps_w, ps_h], center=true); //pressure sensor

  translate([0, -box_iw/2 + seed_l/2 - wall_thickness, -box_ih / 2 -.25]) qt_py_esp32s3();
  translate([0, box_iw/2 - seed_l/2 + wall_thickness, -box_ih / 2 +3]) qt_py_bff();

  translate([-2.5, 5, wall_thickness/2 ])
    color("blue")cube([battery_d, battery_w, battery_h], center=true); //battery
}





// From The_Hans: https://gist.github.com/thehans/b47ab7077c862361eb5d8f095448b2d4
// linear_extrude with optional fillet radius on each end
// Parameters:
//   height - total extrusion length including radii
//   r1 - bottom radius
//   r2 - top radius
//    positive radii will expand outward towards their end
//    negative will shrink inward towards their end
// Limitations: 
//   - individual children of fillet_extrude should be convex
//   - only straight extrudes with no twist or scaling supported
//   - fillets only for 90 degress betweeen Z axis and top/bottom surface
module fillet_extrude(height = 100, r1 = 0, r2 = 0) {
  function fragments(r = 1) =
    ($fn > 0) ? ($fn >= 3 ? $fn : 3) : ceil(max(min(360.0 / $fa, r * 2 * PI / $fs), 5));
  assert(abs(r1) + abs(r2) <= height);
  midh = height - abs(r1) - abs(r2);
  eps = 1 / 1024;
  union() {
    if (r1 != 0) {
      fn1 = ceil(fragments(abs(r1)) / 4); // only covering 90 degrees
      for (i = [0:1:$children - 1], j = [1:1:fn1]) {
        a1 = 90 * (j - 1) / fn1;
        a2 = 90 * j / fn1;
        h1 = abs(r1) * (1 - cos(a1));
        h2 = abs(r1) * (1 - cos(a2));
        off1 = r1 * (1 - sin(a1));
        off2 = r1 * (1 - sin(a2));
        hull() {
          translate([0, 0, h1]) {
            // in case radius*2 matches width of object, don't make first layer zero width
            off1 = r1 < 0 && j == 1 ? off1 * (1 - eps) : off1;
            linear_extrude(eps) offset(r=off1) children(i);
          }
          translate([0, 0, h2])
            linear_extrude(eps) offset(r=off2) children(i);
        }
      }
    }
    if (midh > 0) {
      translate([0, 0, abs(r1)])for (i = [0:1:$children - 1]) linear_extrude(midh) children(i);
    }
    if (r2 != 0) {
      fn2 = ceil(fragments(abs(r2)) / 4); // only covering 90 degrees
      translate([0, 0, height - abs(r2) - eps]) {
        for (i = [0:1:$children - 1], j = [1:1:fn2]) {
          a1 = 90 * (j - 1) / fn2;
          a2 = 90 * j / fn2;
          h1 = abs(r2) * (sin(a1));
          h2 = abs(r2) * (sin(a2));
          off1 = r2 * (1 - cos(a1));
          off2 = r2 * (1 - cos(a2));
          hull() {
            translate([0, 0, h1])
              linear_extrude(eps) offset(r=off1) children(i);
            translate([0, 0, h2]) {
              // in case radius*2 matches width of object, don't make last layer zero width
              off2 = r2 < 0 && j == fn2 ? off2 * (1 - eps) : off2;
              linear_extrude(eps) offset(r=off2) children(i);
            }
          }
        }
      }
    }
  }
}
