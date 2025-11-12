import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Miproyecto } from './miproyecto';

describe('Miproyecto', () => {
  let component: Miproyecto;
  let fixture: ComponentFixture<Miproyecto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Miproyecto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Miproyecto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
