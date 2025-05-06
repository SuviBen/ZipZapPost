import { AsyncPipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { SwUpdate, VersionReadyEvent } from "@angular/service-worker";
import { Observable, filter, map } from "rxjs";
import { IonToast } from "@ionic/angular/standalone";

@Component({
    selector: 'app-update',
    template: `
      <ion-toast
        #updateToast
        message="New version available. Update now?"
        [duration]="30000"
        [buttons]="toastButtons"
      ></ion-toast>
    `,
    standalone: true,
    imports: [AsyncPipe, IonToast],
})
export class AppUpdateComponent implements OnInit {
    @ViewChild('updateToast') updateToast!: IonToast;
    toastButtons = [
      {
        text: 'Update',
        role: 'confirm',
        handler: () => {
          this._reload();
        },
      }
    ];

    constructor(
        private readonly _sw: SwUpdate,
    ){}

    ngOnInit() {
      // Check if service worker updates are supported
      if (this._sw.isEnabled) {
        console.log('Service Worker is enabled');
        
        // Check for updates when app starts
        this._checkForUpdates();

        // Subscribe to version updates
        this._sw.versionUpdates
          .pipe(
            filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'),
            map(event => {
              console.log('Current version is', event.currentVersion);
              console.log('New version is', event.latestVersion);
              return event;
            })
          )
          .subscribe({
            next: () => {
              this._displayNotification();
            },
            error: (err) => {
              console.error('Error checking for updates:', err);
            }
          });

        // Check for updates every 6 hours
        setInterval(() => {
          this._checkForUpdates();
        }, 6 * 60 * 60 * 1000);
      } else {
        console.warn('Service Worker is not enabled');
      }
    }

    private _checkForUpdates() {
      console.log('Checking for updates...');
      this._sw.checkForUpdate()
        .then(updateAvailable => {
          console.log('Update available?', updateAvailable);
          if (updateAvailable) {
            this._displayNotification();
          }
        })
        .catch(err => {
          console.error('Error checking for updates:', err);
        });
    }

    private async _displayNotification() {
        if (this.updateToast) {
            await this.updateToast.present();
            setTimeout(() => {
                this._reload();
            }, 30000);
        }
    }

    async _reload() {
        try {
          const updated = await this._sw.activateUpdate();
          console.log('Update activated:', updated);
          window.location.reload();
        } catch (err) {
          console.error('Error activating update:', err);
          // Force reload even if activation fails
          window.location.reload();
        }
    }
} 