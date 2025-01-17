const router = require("express").Router();
const Users = require("../models/Users");
const argon2 = require("argon2");
const { Op } = require("sequelize");

// Render all data from database
router.get("/", async (req, res) => {
  const result = await Users.findAll({
    order: [["updatedAt", "DESC"]],
  });
  if (result.length < 0) {
    res.json({ msg: "Data tidak ditemukan" });
  } else {
    res.render("dashboard/dashboard-users", {
      layout: "./layout/main",
      title: "Halaman Data Users",
      result,
    });
  }
});

// Render form ADD / TAMBAH
router.get("/add", async (req, res) => {
  res.render("tambah-components/Users", {
    layout: "./layout/main",
    title: "Halaman Tambah User",
  });
});

// Handling ADD / TAMBAH user
router.post("/add", async (req, res) => {
  const { nama, email, nomor_telepon, password, confirm, jenis_kelamin, alamat } = req.body;
  if (password != confirm) {
    res.render("components/confirm", {
      layout: "./layout/main",
      title: "Gagal Input Data",
      desc: "Password tidak cocok harap masukkan ulang",
      link: "users",
    });
  } else {
    const hash = await argon2.hash(password);
    const result = await Users.create({
      nama: nama,
      email: email,
      nomor_telepon: nomor_telepon,
      password: hash,
      jenis_kelamin: jenis_kelamin,
      alamat: alamat,
    });
    if (!result) {
      res.json({ msg: "Terjadi kesalahan" });
    } else {
      res.render("components/confirm", {
        layout: "./layout/main",
        title: "Berhasil Menambahkan User",
        desc: `Berhasil menambahkan user ${nama}`,
        link: "users",
      });
    }
  }
});

// DELETE Handling for USERS table
router.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  const result = await Users.destroy({ where: { nama: id } });
  if (result.length < 0) {
    res.json({ msg: "Data tidak ditemukan" });
  } else {
    res.render("components/confirm", {
      layout: "./layout/main",
      title: "Data berhasil dihapus",
      desc: `Data Users ${id} Berhasil dihapus`,
      link: "users",
    });
  }
});

// Render form EDIT Users
router.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  const result = await Users.findOne({ where: { id: id } });
  if (!result) {
    res.json("Terjadi Kesalahan");
  } else {
    res.render("edit-components/Users", {
      layout: "./layout/main",
      title: "Halaman Edit Users",
      result,
    });
  }
});

// Handling form EDIT Users
router.post("/edit", async (req, res) => {
  const { id, nama, email, password, confirm } = req.body;
  if (password != confirm) {
    res.json({ msg: "Password tidak sama harap cek kembali" });
  } else {
    const hash = await argon2.hash(password);
    const result = await Users.update(
      {
        nama: nama,
        email: email,
        password: hash,
      },
      {
        where: { id: id },
      }
    );
    if (!result) {
      res.json({ msg: "Terjadi kesalahan" });
    } else {
      res.render("components/confirm", {
        layout: "./layout/main",
        title: "Berhasil edit user",
        desc: "Berhasil edit user",
        link: "users",
      });
    }
  }
});

// Handling fitur SEARCH
router.post("/search", async (req, res) => {
  const { search } = req.body;
  const result = await Users.findAll({
    where: {
      [Op.or]: [{ nama: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }, { nomor_telepon: { [Op.like]: `%${search}%` } }, { jenis_kelamin: { [Op.like]: `%${search}%` } }, { alamat: { [Op.like]: `%${search}%` } }],
    },
  });
  if (!result) {
    res.render("components/confirm", {
      layout: "./layout/main",
      title: "Halaman Data Users",
      desc: "Gagal Menemukan Data",
      link: "users",
    });
  } else {
    res.render("dashboard/dashboard-users", {
      layout: "./layout/main",
      title: "Halaman Data Product",
      result,
    });
  }
});

module.exports = router;
