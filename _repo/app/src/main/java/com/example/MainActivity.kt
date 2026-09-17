package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import com.example.data.db.AppDatabase
import com.example.data.repository.AccountingRepository
import com.example.ui.AccountingViewModel
import com.example.ui.MainAppScreen
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

  private val viewModel: AccountingViewModel by viewModels {
    val database = AppDatabase.getInstance(applicationContext)
    val repository = AccountingRepository(database.accountingDao())
    AccountingViewModel.provideFactory(repository)
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        MainAppScreen(viewModel = viewModel)
      }
    }
  }
}
