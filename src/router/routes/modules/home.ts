const home = [{
  path: "/home",
  name: "Home",
  component: () => import("~/pages/home/index.vue"),
  meta: {
    title: "Home",
  },
},
{
  path: "/hero",
  name: "Hero",
  component: () => import("~/pages/home/components/Hero.vue"),
},
];

export default home;
