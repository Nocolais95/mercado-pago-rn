package com.mercadopago.reactnative

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import com.mercadopago.android.px.core.MercadoPagoCheckout
import com.mercadopago.android.px.model.PaymentResult
import com.mercadopago.android.px.model.exceptions.MercadoPagoError

class MercadoPagoActivity : Activity() {
    
    companion object {
        private const val EXTRA_PREFERENCE_ID = "preference_id"
        private const val EXTRA_PRIVATE_KEY = "private_key"
        
        fun createIntent(activity: Activity, preferenceId: String, privateKey: String): Intent {
            return Intent(activity, MercadoPagoActivity::class.java).apply {
                putExtra(EXTRA_PREFERENCE_ID, preferenceId)
                putExtra(EXTRA_PRIVATE_KEY, privateKey)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        val preferenceId = intent.getStringExtra(EXTRA_PREFERENCE_ID)
        val privateKey = intent.getStringExtra(EXTRA_PRIVATE_KEY)
        
        if (preferenceId != null && privateKey != null) {
            startCheckout(preferenceId, privateKey)
        } else {
            finishWithError("Preference ID or Private Key not provided")
        }
    }

    private fun startCheckout(preferenceId: String, privateKey: String) {
        try {
            val checkout = MercadoPagoCheckout.Builder(this, preferenceId)
                .setPrivateKey(privateKey)
                .build()
            
            checkout.startPayment(this, CHECKOUT_REQUEST_CODE)
        } catch (e: Exception) {
            finishWithError("Error starting checkout: ${e.message}")
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        when (requestCode) {
            CHECKOUT_REQUEST_CODE -> {
                when (resultCode) {
                    RESULT_OK -> {
                        val paymentResult = data?.getParcelableExtra<PaymentResult>(MercadoPagoCheckout.EXTRA_PAYMENT_RESULT)
                        if (paymentResult != null) {
                            finishWithSuccess(paymentResult)
                        } else {
                            finishWithError("Payment result is null")
                        }
                    }
                    RESULT_CANCELED -> {
                        finishWithCancel()
                    }
                    MercadoPagoCheckout.PAYMENT_RESULT_CODE -> {
                        val paymentResult = data?.getParcelableExtra<PaymentResult>(MercadoPagoCheckout.EXTRA_PAYMENT_RESULT)
                        if (paymentResult != null) {
                            finishWithSuccess(paymentResult)
                        } else {
                            finishWithError("Payment result is null")
                        }
                    }
                    MercadoPagoCheckout.ERROR_RESULT_CODE -> {
                        val error = data?.getParcelableExtra<MercadoPagoError>(MercadoPagoCheckout.EXTRA_ERROR)
                        if (error != null) {
                            finishWithError(error.message ?: "Unknown error")
                        } else {
                            finishWithError("Unknown error occurred")
                        }
                    }
                    else -> {
                        finishWithError("Unexpected result code: $resultCode")
                    }
                }
            }
            else -> {
                super.onActivityResult(requestCode, resultCode, data)
            }
        }
    }

    private fun finishWithSuccess(paymentResult: PaymentResult) {
        val resultIntent = Intent().apply {
            putExtra("type", "success")
            putExtra("payment_id", paymentResult.paymentId.toString())
            putExtra("status", paymentResult.status)
            putExtra("status_detail", paymentResult.statusDetail)
            putExtra("payment_method_id", paymentResult.paymentMethodId)
            putExtra("payment_type_id", paymentResult.paymentTypeId)
            putExtra("transaction_amount", paymentResult.transactionAmount)
            putExtra("currency_id", paymentResult.currencyId)
            putExtra("description", paymentResult.description)
        }
        setResult(RESULT_OK, resultIntent)
        finish()
    }

    private fun finishWithError(message: String) {
        val resultIntent = Intent().apply {
            putExtra("type", "error")
            putExtra("message", message)
        }
        setResult(RESULT_CANCELED, resultIntent)
        finish()
    }

    private fun finishWithCancel() {
        val resultIntent = Intent().apply {
            putExtra("type", "cancel")
        }
        setResult(RESULT_CANCELED, resultIntent)
        finish()
    }

    companion object {
        private const val CHECKOUT_REQUEST_CODE = 1
    }
} 