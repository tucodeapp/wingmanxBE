## IOS FLOW

1. Appse ivyksta successful subscription purchase.
2. Siunciame receipt i tavo nauja sukurta endpoint.
3. naujame endpointe vykdome ios receipt validacija: 

```javascript
const validateReceipt = asyncHandler(async (req, res) => {
  const { receipt, userEmail } = req.body;

  if (!receipt || !userEmail) {
    return res.status(400).json({ message: "Missing receipt or user ID" });
  }

  const response = await axios.post(
    "https://sandbox.itunes.apple.com/verifyReceipt",
    {
      "receipt-data": receipt,
       password: "ac06543ca9d44f6086d600cb40246693",
    }
  );

  
  if (response.data.status === 0) {
    const { original_transaction_id } = response.data.latest_receipt_info.sort(
      (a, b) => Number(b.expires_date_ms) - Number(a.expires_date_ms)
    )[0];

    await User.findOneAndUpdate(
      { email: userEmail },
      {
// Suradus useri as pridedu situos values prie user.subscription objecto
        $set: {
// Sito reikes susirasti useri
          "subscription.originalTransactionId": original_transaction_id,
// Flagas, kad isnaudojom nuolaida
          "subscription.isIntroOfferPeriodExpired": true,
// Flagas, kad turim subscriptiona
          "subscription.isUserSubscribedToIAP": true,
        },
      },
      { new: true, upsert: true }
    );

// Reiktu statusa grazinti. Jeigu statusas 0 tada as callinu finishTransaction appse ir tada pilnai uzfiksuoajme pardavima ir gauname notification is Apple i notifications endpointa
    res
      .status(200)
      .json({ message: "Subscription updated", status: response.data.status });
  } else {
    res.status(400).json({ message: "Ooops something went wrong" });
  }
});


