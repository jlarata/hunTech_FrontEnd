import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Formcreateproyect } from './formcreateproyect';

describe('Formcreateproyect', () => {
  let component: Formcreateproyect;
  let fixture: ComponentFixture<Formcreateproyect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Formcreateproyect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Formcreateproyect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
