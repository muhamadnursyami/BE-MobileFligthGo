import jwt from "jsonwebtoken";
import { decode } from "jsonwebtoken";
import { createError } from "./error.js";
// Fungsi verifyToken ini digunakan sebagai middleware untuk memverifikasi token otentikasi sebelum mengizinkan akses ke rute atau handler berikutnya. Jika token tidak valid atau tidak ada, akan direspon dengan pesan kesalahan yang sesuai.
export const verifyToken = (req, res, next) => {
    // Mengambil token dari header Authorization yang dikirim dalam request. Token dipecah dengan spasi dan hanya mengambil bagian kedua yang berisi token.
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    //ika token tidak ada, maka middleware akan memanggil fungsi next() dengan membawa objek kesalahan yang dibuat menggunakan createError() dengan kode status 401 dan pesan "You are not authenticated!".
    if(!token) return next(createError(401, "You are not authenticated!"));
    // Menggunakan jwt.verify() untuk memverifikasi token. Jika terjadi kesalahan dalam verifikasi, middleware akan memanggil fungsi next() dengan membawa objek kesalahan yang dibuat menggunakan createError() dengan kode status 403 dan pesan "Token is not valid!".
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) return next(createError(403, "Token is not valid!"));
    // Jika token berhasil diverifikasi, data yang terkandung dalam token (decoded) akan disimpan dalam properti req.user. Properti req.user akan berisi informasi seperti userId, image_user, name, email, role, phone, address, visa, passport, dan izin.
    req.user ={
        userId: decoded.userId,
        image_user: decoded.image_user,
        name: decoded.name,
        email : decoded.email,
        role: decoded.role,
        phone: decoded.phone,
        address: decoded.address,
        visa: decoded.visa,
        passport: decoded.passport,
        izin: decoded.izin,
    }
    // Menyimpan email dan role dari decoded token dalam properti req.email dan req.role secara terpisah.
    req.email = decoded.email,
    req.role= decoded.role
    next(); //Menyimpan email dan role dari decoded token dalam properti req.email dan req.role secara terpisah.
    })
}



