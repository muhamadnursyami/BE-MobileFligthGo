import Users from "../models/UserModel.js";
import jwt from "jsonwebtoken";
// Fungsi untuk memperbarui token (refresh token)
export const refreshToken = async(req, res) => {
    try {
        // Mengambil refresh token dari cookie pada request
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.sendStatus(401);
        // Mencari pengguna berdasarkan refresh token
        const user = await Users.findAll({
            where:{
                refresh_token: refreshToken
            }
        });
        // Jika tidak ditemukan pengguna dengan refresh token yang sesuai, mengembalikan status 403 (Forbidden)
        if(!user[0]) return res.sendStatus(403);
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if(err) return res.sendStatus(403);
            // Mendapatkan data pengguna yang diperlukan
            const userId = user[0].id;
            const name = user[0].name;
            const email = user[0].email;
            const phone = user[0].phone;
            const address = user[0].address;
            const image_user = user[0].image_user;
            const visa = user[0].visa;
            const passport = user[0].passport;
            const izin = user[0].izin;
            // Membuat token akses baru menggunakan data pengguna
            const accessToken = jwt.sign({userId, name, email, phone, address, image_user, visa, passport,izin}, process.env.ACCESS_TOKEN_SECRET,{
                expiresIn: '1d'
            });
            // Mengirimkan token akses baru sebagai respons
            res.json({ accessToken });
        });
    } catch (error) {
        console.log(error);
    }
}