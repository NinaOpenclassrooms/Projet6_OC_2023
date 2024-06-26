const Sauce = require('../models/sauce');

const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            if (req.file) {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlinkSync(`images/${filename}`);
            }
            Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
                .catch(error => res.status(401).json({ error }));
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => { res.status(200).json({ message: 'Sauce supprimée !' }) })
                    .catch(error => res.status(401).json({ error }));
            });
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.likeSauce = (req, res, next) => {
    const likeObject = req.body;
    const like = likeObject.like;

    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (req.body.userId != req.auth.userId) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            //Ajout d'un like
            if (like == 1 && !sauce.usersLiked.includes(req.auth.userId)) {
                if (sauce.usersDisliked.includes(req.auth.userId)) {
                    return res.status(409).json({ message: 'Sauce déjà dislikée!' })
                }
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { likes: 1 },
                        $push: { usersLiked: req.auth.userId },
                        _id: req.params.id
                    }
                )
                    .then(() => { res.status(200).json({ message: 'Like pris en compte !' }) })
                    .catch(error => res.status(400).json({ error }));
            }

            //Ajout d'un dislike
            if (like == -1 && !sauce.usersDisliked.includes(req.auth.userId)) {
                if (sauce.usersLiked.includes(req.auth.userId)) {
                    return res.status(409).json({ message: 'Sauce déjà likée!' })
                }
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { dislikes: 1 },
                        $push: { usersDisliked: req.auth.userId },
                        _id: req.params.id
                    }
                )
                    .then(() => { res.status(200).json({ message: 'Dislike pris en compte !' }) })
                    .catch(error => res.status(400).json({ error }));
            }

            //Annulation d'un like
            if (like == 0 && sauce.usersLiked.includes(req.auth.userId)) {
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { likes: -1 },
                        $pull: { usersLiked: req.auth.userId },
                        _id: req.params.id
                    }
                )
                    .then(() => { res.status(200).json({ message: 'Annulation like prise en compte !' }) })
                    .catch(error => res.status(400).json({ error }));
            }

            //Annulation d'un dislike
            if (like == 0 && sauce.usersDisliked.includes(req.auth.userId)) {
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { dislikes: -1 },
                        $pull: { usersDisliked: req.auth.userId },
                        _id: req.params.id
                    }
                )
                    .then(() => { res.status(200).json({ message: 'Annulation dislike prise en compte !' }) })
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};