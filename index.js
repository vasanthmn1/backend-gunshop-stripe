const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv').config()
const Stripe = require('stripe')


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express()
app.get('/', (req, res) => {
    res.json("  Api");
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(cors({
    origin: "*"
}))
app.post('/create-checkout-session', async (req, res) => {


    const { cartItems } = req.body
    try {
        const params = {
            submit_type: 'pay',
            mode: 'payment',
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            shipping_options: [
                { shipping_rate: 'shr_1NL12VSGT5voFN9r4pIOXDuE' },
            ],
            line_items: cartItems.map((item) => {
                const img = item.image[0].asset._ref;
                const newImage = img.replace('image-', 'https://cdn.sanity.io/images/ryyj1tu4/production/').replace('-webp', '.webp');

                return {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: item.name,
                            images: [newImage],
                        },
                        unit_amount: item.price * 100,
                    },
                    adjustable_quantity: {
                        enabled: true,
                        minimum: 1,
                    },
                    quantity: item.quantity
                }
            }),

            mode: "payment",
            success_url: `http://localhost:5173/success`,
            cancel_url: `http://localhost:5173/cancel`
        }
        const session = await stripe.checkout.sessions.create(params)
        res.status(200).json(session)
    } catch (error) {
        console.log(error);
    }
})

app.listen(8000, () => console.log('Server started '))

