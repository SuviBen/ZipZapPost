import { AsyncPipe } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
import { SwUpdate } from "@angular/service-worker";
import { Observable, switchMap } from "rxjs";
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
      {{updateAvailable$ | async }}
    `,
    standalone: true,
    imports: [AsyncPipe, IonToast],
})
export class AppUpdateComponent {
    @ViewChild('updateToast') updateToast!: IonToast;
    updateAvailable$!: Observable<any>;
    toastButtons = [
      {
        text: 'OK',
        role: 'confirm',
        handler: () => {
          this._reload();
        },
      }
    ];

    constructor(
        private readonly _sw: SwUpdate,
    ){
        this.updateAvailable$ = this._sw.versionUpdates.pipe(
            switchMap(async (event) => {
                console.log('event', event);

                if (event.type === 'VERSION_READY') {
                    await this._displayNotification();
                }
            }),
        )
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
        await this._sw.activateUpdate().then(() => {
            window.location.reload();
        });
    }
} 