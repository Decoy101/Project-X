import { Router } from 'express';
const router = new Router();
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';

//Load Input Validation
import validateLoginInput from '../validation/login.js';

//Post Router api/admin/login
router.post('/admin/login', (req, res) => {
    //Login Validation
    const {
        errors,
        isValid
    } = validateLoginInput(req.body);

    //Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    //Find User By Email
    Admin.findOne({
        email:email
    }).then(user => {
        //Check if Your Exists
        if (!user) {
            return res.status(404).json({
                emailNotFound: "Email is not registered"
            });
        }

        //Match Password
        bcrypt.compare(password, user.password)
            .then(isMatch => {
                if (isMatch) {
                    //User Matched
                    //Create JWT Payload
                    const payload = {
                        id: user.id,
                        name: user.name
                    };

                    //Sign Token
                    jwt.sign(payload, process.env.SECRET, {

                        expiresIn: 172800 //2 days in seconds    ‬
                    }, async(err, token) => {

                        user.token = token
                        await user.save()

                        // console.log(user)
                        res.json({
                            success: true,
                            token: token,
                            user: user.name
                        });
                    });
                } else {
                    return res.status(400).json({
                        passwordIncorrect: "Password incorrect"
                    });
                }
            });
    });
});

export default router