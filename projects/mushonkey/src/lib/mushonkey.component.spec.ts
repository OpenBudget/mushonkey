import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MushonkeyComponent } from './mushonkey.component';

describe('MushonkeyComponent', () => {
  let component: MushonkeyComponent;
  let fixture: ComponentFixture<MushonkeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MushonkeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MushonkeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
