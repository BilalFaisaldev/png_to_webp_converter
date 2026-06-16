module.exports = async (req, res) => {
    return res.status(403).json({ 
        error: 'Public registration is disabled. Please request access from the administrator via WhatsApp.' 
    });
};
