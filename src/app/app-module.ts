import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ToasterComponent } from './shared/components/toaster/toaster';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule, ToasterComponent],
  providers: [provideHttpClient(withInterceptors([jwtInterceptor])), provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}