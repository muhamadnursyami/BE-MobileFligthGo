import product from "../models/ProductModel.js";
import wishlist from "../models/WishlistModel.js";
// FUNGSI UNTUK MENAMBAHKAN WISHLIST
export const createWishlist = async(req, res) => {
    try {
        //
        if(req.user.role == "admin") {
            return res.status(400).json({
                success: false,
                message: "Kamu adalah admin tidak bisa membuat wishlist",
            });
        }else{
            // ika pengguna bukan admin, maka membuat wishlist baru dengan menggunakan model wishlist.create(). Data yang dimasukkan adalah ID produk (productId) dan ID pengguna (userId).
            const Wishlist = await wishlist.create({
                productId: req.params.id,
                userId: req.user.userId,
            })
            // Mengembalikan respons dengan status 201 dan objek JSON yang berisi pesan "berhasil membuat wishlist" beserta data wishlist yang baru saja dibuat.
            res.status(201).send({
                status: 201,
                message: 'berhasil membuat wishlist',
                data: Wishlist
            })
        }
    } catch (error) {
        res.status(402).json({
            status: "FAIL",
            message: error.message,
        });
    }
}
// FUNGSI UNTUK MENAMPILKAN SEMUA WISHLIST
export const listWishlist = async (req, res) => {
    try {
        // Mengambil daftar wishlist dengan menggunakan model wishlist.findAll(). Filter digunakan untuk mencari wishlist berdasarkan userId yang sesuai dengan pengguna yang sedang terautentikasi. Juga, menggunakan opsi include untuk menyertakan informasi produk yang terkait dengan setiap wishlist.
        const sourceWishlist = await wishlist.findAll({
            where: {
                userId: req.user.userId,
            },
            include: product
        })
        // Mengembalikan respons dengan status 201 dan objek JSON yang berisi pesan status "SUCCESS" dan data daftar wishlist yang ditemukan.
        res.status(201).send({
            status: 201,
            data: sourceWishlist
        })
    } catch (error) {
        res.status(400).send({
            status: "FAIL",
            message: error.message,
        })
    }
}
// FUNGSI UNTUK MENGHAPUS WISHLIST
export const deleteWishlist = async(req, res) => {
    const { id } = req.params; // Mengambil ID wishlist yang akan dihapus dari req.params.
    try {
        // Menggunakan model wishlist.destroy() untuk menghapus wishlist berdasarkan ID yang diberikan.
        await wishlist.destroy({
            where: { id },
        });
        // Mengembalikan respons dengan status 200 dan objek JSON yang berisi pesan sukses bahwa wishlist telah berhasil dihapus
        return res.status(200).json({
            success: true,
            message: "Delete wishlist Successfully",
        });
    } catch (error) {
        console.log(error);
    }
}